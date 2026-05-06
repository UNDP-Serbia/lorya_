import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import * as path from 'path'
import { DataSource } from 'typeorm'
import { runInTransaction } from 'src/common/helpers'
import { DirectoryService } from 'src/directory/directory.service'
import { FileService } from 'src/file/file.service'
import { FileEntity } from 'src/file/file.entity'
import { FileStatus } from 'src/file/types'
import { AiService } from 'src/ai/ai.service'
import { OcrService } from 'src/ocr/ocr.service'
import { ModelProcessDto } from 'src/ocr/dto'
import { SaveWordEditDto } from 'src/common/dto/save-word-edit.dto'
import { SegmentRepository } from 'src/segment-management/segment.repository'
import { ActivityService } from 'src/activity/activity.service'
import {
  ActivityOperation,
  ActivityStatus,
  AiActivityModelType,
} from 'src/activity/enums'
import { PostOcrCorrectionResultRepository } from './post-ocr-correction-result.repository'
import { PostOcrCorrectionModelRepository } from './post-ocr-correction-model.repository'
import { PostOcrCorrectionModelType } from './types/post-ocr-correction-model-type.enum'
import {
  PostOcrCorrectionProcessingResultDto,
  PostOcrCorrectionSegmentDataDto,
  PostOcrCorrectionResultsResponseDto,
} from './dto'

@Injectable()
export class PostOcrCorrectionService {
  private readonly logger = new Logger(PostOcrCorrectionService.name)

  constructor(
    @Inject('SCRIPT_DIR') private readonly scriptDir: string,
    @Inject('CONDA_ENV') private readonly condaEnv: string,
    private readonly aiService: AiService,
    private readonly directoryService: DirectoryService,
    private readonly fileService: FileService,
    private readonly ocrService: OcrService,
    private readonly postOcrCorrectionResultRepository: PostOcrCorrectionResultRepository,
    private readonly modelRepository: PostOcrCorrectionModelRepository,
    private readonly segmentRepository: SegmentRepository,
    private readonly activityService: ActivityService,
    private readonly dataSource: DataSource
  ) {}

  async getResultsByFileId(
    fileId: string
  ): Promise<PostOcrCorrectionResultsResponseDto> {
    const results =
      await this.postOcrCorrectionResultRepository.findByFileId(fileId)

    return {
      success: true,
      data: results.map(r => ({
        segmentId: r.segmentId,
        segmentFile: path.basename(r.segment.modifiedPath),
        lang: r.lang,
        script: r.script,
        lines: r.lines,
        statistics: {
          avg_word_confidence: r.avgWordConfidence,
          cer: r.cer,
          wer: r.wer,
        },
      })),
    }
  }

  async revert(
    inputDir: string,
    fileName: string,
    userId: string
  ): Promise<{ success: boolean }> {
    const directory = await this.directoryService.resolveByPath(inputDir)
    const file = await this.fileService.findOne({
      name: fileName,
      directoryId: directory?.id ?? null,
    })

    if (!file) {
      throw new NotFoundException('File not found')
    }

    await this.postOcrCorrectionResultRepository.softDeleteByFileId(file.id)
    await this.ocrService.softDeleteResultsByFileId(file.id)

    file.status = FileStatus.SEGMENTED
    await this.fileService.save(file)

    await this.activityService
      .recordManualOperation({
        fileId: file.id,
        userId,
        operation: ActivityOperation.POST_OCR_REVERT,
        metadata: {},
      })
      .catch(e => this.logger.error(`Activity log failed: ${e.message}`))

    return { success: true }
  }

  async processModel(
    id: string,
    data: ModelProcessDto,
    userId: string
  ): Promise<PostOcrCorrectionProcessingResultDto> {
    const model = await this.modelRepository.findById(id)
    if (!model) throw new NotFoundException('Model not found.')
    if (model.type === PostOcrCorrectionModelType.HUGGINGFACE) {
      throw new BadRequestException('Model is not executable yet')
    }
    if (!model.reference) {
      throw new ForbiddenException('Model is not executable.')
    }

    const { inputDir, fileName } = data

    const directory = await this.directoryService.resolveByPath(inputDir)
    const directoryId = directory?.id ?? null
    const file = await this.fileService.findOne({
      name: fileName,
      directoryId,
    })
    if (!file) {
      throw new NotFoundException(`File ${fileName} not found.`)
    }

    const activity = await this.activityService.startModelRun({
      fileId: file.id,
      userId,
      modelType: AiActivityModelType.POST_OCR_CORRECTION,
      modelId: id,
      operation: ActivityOperation.POST_OCR_CORRECTION,
      modelRunId: data.modelRunId ?? null,
    })

    let activityStatus: ActivityStatus.SUCCESS | ActivityStatus.FAILURE =
      ActivityStatus.FAILURE
    let exitCode: number | null = null
    let errorMessage: string | null = null
    let metadata: Record<string, unknown> | null = null
    const startTime = Date.now()

    try {
      const ocrResults = await this.ocrService.getOcrResultsByFileId(file.id)
      if (!ocrResults.data || ocrResults.data.length === 0) {
        throw new BadRequestException(
          'No OCR results found. Please run OCR first.'
        )
      }

      const scriptPath = path.join(this.scriptDir, model.reference)
      const segmentResults: PostOcrCorrectionSegmentDataDto[] = []

      for (const ocrSegment of ocrResults.data) {
        const linesForScript = ocrSegment.lines.map(line => ({
          line_id: line.line_id,
          words: line.words.map(w => ({
            word_id: w.word_id,
            word_confidence: w.word_confidence,
            word_text: w.edited_word_text ?? w.word_text,
          })),
        }))

        const inputJson = JSON.stringify({
          id: ocrSegment.segmentId,
          lines: linesForScript,
        })

        try {
          const result = (await this.aiService.runScript(
            'python',
            [scriptPath, inputJson],
            {
              env: {
                ...process.env,
                PATH: `${this.condaEnv}/bin:${process.env.PATH ?? ''}`,
              },
            }
          )) as string

          const parsed = JSON.parse(result.trim()) as {
            id: string
            status?: { success?: boolean; messageText?: string }
            lines: typeof ocrSegment.lines
            statistics: {
              cer: number
              wer: number
              avg_word_confidence: number
            }
          }

          const status = parsed?.status
          if (!status?.success) {
            throw new BadRequestException(
              status?.messageText ||
                `Failed to process segment ${ocrSegment.segmentId}.`
            )
          }

          // Strip edited_word_text from script output so Post-OCR results start clean
          const cleanLines = parsed.lines.map(line => ({
            ...line,
            words: line.words.map(({ edited_word_text: _, ...w }) => w),
          }))

          segmentResults.push({
            segmentId: ocrSegment.segmentId,
            segmentFile: ocrSegment.segmentFile,
            lang: ocrSegment.lang,
            script: ocrSegment.script,
            lines: cleanLines,
            statistics: {
              avg_word_confidence: parsed.statistics.avg_word_confidence,
              cer: parsed.statistics.cer,
              wer: parsed.statistics.wer,
            },
          })
        } catch (err) {
          if (err instanceof BadRequestException) throw err
          this.logger.error(
            `Post-OCR correction failed: segment ${ocrSegment.segmentId}`,
            err
          )
          throw new BadRequestException(
            `Failed to process segment ${ocrSegment.segmentId}.`
          )
        }
      }

      await runInTransaction(this.dataSource, async queryRunner => {
        await this.postOcrCorrectionResultRepository.softDeleteByFileIdTransactional(
          queryRunner,
          file.id
        )
        await this.postOcrCorrectionResultRepository.createManyTransactional(
          queryRunner,
          segmentResults.map(sr => ({
            lang: sr.lang,
            script: sr.script,
            avgWordConfidence: sr.statistics.avg_word_confidence,
            cer: sr.statistics.cer,
            wer: sr.statistics.wer,
            lines: sr.lines,
            segmentId: sr.segmentId,
            modelRunId: data.modelRunId ?? null,
          }))
        )

        await queryRunner.manager.update(
          FileEntity,
          { id: file.id },
          { status: FileStatus.POST_OCR_COMPLETED }
        )
      })

      const result: PostOcrCorrectionProcessingResultDto = {
        success: true,
        message: 'Post-OCR correction completed.',
        data: segmentResults,
      }
      metadata =
        (this.aiService.readExitStatus() as Record<string, unknown> | null) ??
        null
      activityStatus = ActivityStatus.SUCCESS
      exitCode = 0
      return result
    } catch (err) {
      errorMessage = (err as Error).message
      exitCode = (err as { code?: number }).code ?? null
      metadata =
        (this.aiService.readExitStatus() as Record<string, unknown> | null) ??
        null
      throw err
    } finally {
      await this.activityService
        .completeModelRun({
          activityId: activity.id,
          status: activityStatus,
          exitCode,
          errorMessage,
          metadata,
          durationMs: Date.now() - startTime,
        })
        .catch(e => this.logger.error(`Activity log failed: ${e.message}`))
    }
  }

  async saveWordEdit(
    dto: SaveWordEditDto,
    userId: string
  ): Promise<{ success: boolean }> {
    const entity = await this.postOcrCorrectionResultRepository.findBySegmentId(
      dto.segmentId
    )
    if (!entity) {
      throw new NotFoundException(
        'Post-OCR correction result not found for segment.'
      )
    }

    const line = entity.lines.find(l => l.line_id === dto.lineId)
    if (!line || !line.words[dto.wordIndex]) {
      throw new NotFoundException('Word not found.')
    }

    line.words[dto.wordIndex].edited_word_text = dto.newText
    await this.postOcrCorrectionResultRepository.save(entity)

    const segment = await this.segmentRepository.findOneById(dto.segmentId)
    if (segment) {
      await this.activityService
        .recordManualOperation({
          fileId: segment.fileId,
          userId,
          operation: ActivityOperation.POST_OCR_TEXT_EDIT,
          segmentId: dto.segmentId,
          metadata: { lineId: dto.lineId, wordIndex: dto.wordIndex },
        })
        .catch(e => this.logger.error(`Activity log failed: ${e.message}`))
    }

    return { success: true }
  }
}

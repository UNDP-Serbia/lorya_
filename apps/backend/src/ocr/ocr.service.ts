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
import { PathService } from 'src/common/services'
import { runInTransaction } from 'src/common/helpers'
import { DirectoryService } from 'src/directory/directory.service'
import { FileService } from 'src/file/file.service'
import { FileEntity } from 'src/file/file.entity'
import { FileStatus } from 'src/file/types'
import { SegmentRepository } from 'src/segment-management/segment.repository'
import {
  ModelProcessDto,
  OcrProcessingResultDto,
  OcrDataDto,
  OcrSegmentDataDto,
  OcrResultsResponseDto,
} from './dto'
import { AiService } from 'src/ai/ai.service'
import { SaveWordEditDto } from 'src/common/dto/save-word-edit.dto'
import { ActivityService } from 'src/activity/activity.service'
import {
  ActivityOperation,
  ActivityStatus,
  AiActivityModelType,
} from 'src/activity/enums'
import { OcrResultRepository } from './ocr-result.repository'
import { OcrModelRepository } from './ocr-model.repository'
import { OcrModelType } from './types/ocr-model-type.enum'

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name)

  constructor(
    @Inject('SCRIPT_DIR') private readonly scriptDir: string,
    @Inject('ROOT_PATH_SERVICE') private readonly pathService: PathService,
    @Inject('SEGMENTS_PATH') private readonly segmentsPath: string,
    @Inject('CONDA_ENV') private readonly condaEnv: string,
    private readonly aiService: AiService,
    private readonly directoryService: DirectoryService,
    private readonly fileService: FileService,
    private readonly segmentRepository: SegmentRepository,
    private readonly ocrResultRepository: OcrResultRepository,
    private readonly ocrModelRepository: OcrModelRepository,
    private readonly activityService: ActivityService,
    private readonly dataSource: DataSource
  ) {}

  async getOcrResultsByFileId(fileId: string): Promise<OcrResultsResponseDto> {
    const results = await this.ocrResultRepository.findByFileId(fileId)

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
        },
      })),
    }
  }

  async softDeleteResultsByFileId(fileId: string) {
    await this.ocrResultRepository.softDeleteByFileId(fileId)
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

    const existingResults = await this.ocrResultRepository.findByFileId(file.id)
    const deletedResultCount = existingResults.length

    await this.ocrResultRepository.softDeleteByFileId(file.id)

    file.status = FileStatus.SEGMENTED
    await this.fileService.save(file)

    await this.activityService
      .recordManualOperation({
        fileId: file.id,
        userId,
        operation: ActivityOperation.OCR_REVERT,
        metadata: { deletedResultCount },
      })
      .catch(e => this.logger.error(`Activity log failed: ${e.message}`))

    return { success: true }
  }

  async processModel(
    id: string,
    data: ModelProcessDto,
    userId: string
  ): Promise<OcrProcessingResultDto> {
    const model = await this.ocrModelRepository.findById(id)
    if (!model) throw new NotFoundException('Model not found.')
    if (model.type === OcrModelType.HUGGINGFACE) {
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
      modelType: AiActivityModelType.OCR,
      modelId: id,
      operation: ActivityOperation.OCR,
      modelRunId: data.modelRunId ?? null,
    })

    let activityStatus: ActivityStatus.SUCCESS | ActivityStatus.FAILURE =
      ActivityStatus.FAILURE
    let exitCode: number | null = null
    let errorMessage: string | null = null
    let metadata: Record<string, unknown> | null = null
    const startTime = Date.now()

    try {
      const segments = await this.segmentRepository.findByFileId(file.id)
      if (segments.length === 0) {
        throw new BadRequestException(
          'No cropped segments found. Please crop segments first.'
        )
      }

      const scriptPath = path.join(this.scriptDir, model.reference)
      const segmentResults: OcrSegmentDataDto[] = []

      for (const segment of segments) {
        const segmentFileName = path.basename(segment.modifiedPath)
        const segmentFilePath = path.join(
          this.segmentsPath,
          segment.modifiedPath
        )

        try {
          const result = (await this.aiService.runScript(
            'python',
            [scriptPath, segment.id, segmentFilePath],
            {
              env: {
                ...process.env,
                PATH: `${this.condaEnv}/bin:${process.env.PATH ?? ''}`,
                TESSDATA_PREFIX: `${this.condaEnv}/share/tessdata`,
              },
            }
          )) as string

          const parsed = JSON.parse(result.trim()) as {
            status?: { success?: boolean; messageText?: string }
          } & OcrDataDto
          const status = parsed?.status
          if (!status?.success) {
            throw new BadRequestException(
              status?.messageText ||
                `Failed to process segment ${segmentFileName}.`
            )
          }

          segmentResults.push({
            segmentId: segment.id,
            segmentFile: segmentFileName,
            lang: parsed.lang,
            script: parsed.script,
            lines: parsed.lines,
            statistics: parsed.statistics,
          })
        } catch (err) {
          if (err instanceof BadRequestException) throw err
          this.logger.error(`Process segment failed: ${segmentFileName}`, err)
          throw new BadRequestException(
            `Failed to process segment ${segmentFileName}.`
          )
        }
      }

      await runInTransaction(this.dataSource, async queryRunner => {
        await this.ocrResultRepository.softDeleteByFileIdTransactional(
          queryRunner,
          file.id
        )
        await this.ocrResultRepository.createManyTransactional(
          queryRunner,
          segmentResults.map(sr => ({
            lang: sr.lang,
            script: sr.script,
            avgWordConfidence: sr.statistics.avg_word_confidence,
            lines: sr.lines.map(line => ({
              ...line,
              line_id:
                typeof line.line_id === 'string'
                  ? parseInt(line.line_id, 10)
                  : line.line_id,
              words: line.words.map(word => ({
                ...word,
                word_id:
                  typeof word.word_id === 'string'
                    ? parseInt(word.word_id, 10)
                    : word.word_id,
              })),
            })),
            segmentId: sr.segmentId,
            modelRunId: data.modelRunId ?? null,
          }))
        )

        await queryRunner.manager.update(
          FileEntity,
          { id: file.id },
          { status: FileStatus.OCR_COMPLETED }
        )
      })

      const result: OcrProcessingResultDto = {
        success: true,
        message: 'OCR processing completed.',
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
    const entity = await this.ocrResultRepository.findBySegmentId(dto.segmentId)
    if (!entity) {
      throw new NotFoundException('OCR result not found for segment.')
    }

    const line = entity.lines.find(l => l.line_id === dto.lineId)
    if (!line || !line.words[dto.wordIndex]) {
      throw new NotFoundException('Word not found.')
    }

    line.words[dto.wordIndex].edited_word_text = dto.newText
    await this.ocrResultRepository.save(entity)

    const segment = await this.segmentRepository.findOneById(dto.segmentId)
    if (segment) {
      await this.activityService
        .recordManualOperation({
          fileId: segment.fileId,
          userId,
          operation: ActivityOperation.OCR_TEXT_EDIT,
          segmentId: dto.segmentId,
          metadata: { lineId: dto.lineId, wordIndex: dto.wordIndex },
        })
        .catch(e => this.logger.error(`Activity log failed: ${e.message}`))
    }

    return { success: true }
  }
}

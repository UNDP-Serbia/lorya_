import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import * as path from 'path'
import * as fs from 'fs'
import * as crypto from 'crypto'
import { DataSource } from 'typeorm'
import { PathService } from 'src/common/services'
import { AiModelDto } from 'src/ai-model/dto'
import { runInTransaction } from 'src/common/helpers'
import { AiService } from 'src/ai/ai.service'
import { DirectoryService } from 'src/directory/directory.service'
import { FileService } from 'src/file/file.service'
import { ActivityService } from 'src/activity/activity.service'
import { ActivityOperation } from 'src/activity/enums'
import { OcrResultRepository } from 'src/ocr/ocr-result.repository'
import { PostOcrCorrectionResultRepository } from 'src/post-ocr-correction/post-ocr-correction-result.repository'
import { SegmentRepository } from './segment.repository'
import { SEGMENT_MANAGEMENT_MODELS } from './constants'
import {
  AdjustSegmentDto,
  AdjustSegmentResultDto,
  CropSegmentsDto,
  CropSegmentsResultDto,
  SegmentModelProcessDto,
} from './dto'
import { SegmentEntity, SegmentType } from './segment.entity'
import { FileEntity } from 'src/file/file.entity'
import { FileStatus } from 'src/file/types'

@Injectable()
export class SegmentManagementService {
  private readonly logger = new Logger(SegmentManagementService.name)

  constructor(
    @Inject('SCRIPT_DIR') private readonly scriptDir: string,
    @Inject('ROOT_PATH_SERVICE') private readonly pathService: PathService,
    @Inject('SEGMENTS_PATH') private readonly segmentsPath: string,
    @Inject('SEGMENTS_PATH_SERVICE')
    private readonly segmentsPathService: PathService,
    @Inject('CONDA_ENV') private readonly condaEnv: string,
    private readonly dataSource: DataSource,
    private readonly segmentRepository: SegmentRepository,
    private readonly aiService: AiService,
    private readonly directoryService: DirectoryService,
    private readonly fileService: FileService,
    private readonly activityService: ActivityService,
    private readonly ocrResultRepository: OcrResultRepository,
    private readonly postOcrCorrectionResultRepository: PostOcrCorrectionResultRepository
  ) {}

  getModels(): Promise<AiModelDto[]> {
    return Promise.resolve(SEGMENT_MANAGEMENT_MODELS)
  }

  async getSegmentsByFileId(fileId: string): Promise<SegmentEntity[]> {
    return this.segmentRepository.findByFileId(fileId)
  }

  async cropSegments(
    data: CropSegmentsDto,
    userId: string
  ): Promise<CropSegmentsResultDto> {
    const { inputDir, fileName, segments } = data
    const inputPathAbsolute = this.pathService.buildAbsolutePath(
      inputDir,
      fileName
    )
    const directory = await this.directoryService.resolveByPath(inputDir)
    const directoryId = directory?.id ?? null
    const file = await this.fileService.findOne({
      name: fileName,
      directoryId,
    })
    if (!file) {
      throw new NotFoundException(`File ${fileName} not found.`)
    }

    const segmentsWithIds = segments.map(s => ({
      ...s,
      id: crypto.randomUUID(),
    }))

    const originalDir = path.join(this.segmentsPath, file.id, 'original')
    const modifiedDir = path.join(this.segmentsPath, file.id, 'modified')

    fs.mkdirSync(originalDir, { recursive: true })
    fs.mkdirSync(modifiedDir, { recursive: true })

    const scriptPath = path.join(
      this.scriptDir,
      'app',
      'layout',
      'crop_segments.py'
    )

    const segmentsJson = JSON.stringify(
      segmentsWithIds.map(s => ({
        id: s.id,
        label: s.label,
        labelType: s.labelType,
        boundingBox: s.boundingBox,
      }))
    )

    try {
      const result = (await this.aiService.runScript(
        'python',
        [scriptPath, inputPathAbsolute, segmentsJson, originalDir],
        {
          env: {
            ...process.env,
            PATH: `${this.condaEnv}/bin:${process.env.PATH ?? ''}`,
          },
        }
      )) as string

      const parsed = JSON.parse(result.trim()) as {
        status?: { success?: boolean; messageText?: string }
      }
      const status = parsed?.status
      if (!status?.success) {
        throw new BadRequestException(
          status?.messageText || 'Failed to crop segments.'
        )
      }

      const baseName = path.basename(fileName, path.extname(fileName))

      for (const s of segmentsWithIds) {
        const segmentFileName = `cropped_${baseName}_image_${s.id}.jpg`
        const srcPath = path.join(originalDir, segmentFileName)
        const destPath = path.join(modifiedDir, segmentFileName)
        fs.copyFileSync(srcPath, destPath)
      }

      await runInTransaction(this.dataSource, async queryRunner => {
        await this.ocrResultRepository.softDeleteByFileIdTransactional(
          queryRunner,
          file.id
        )
        await this.postOcrCorrectionResultRepository.softDeleteByFileIdTransactional(
          queryRunner,
          file.id
        )
        await this.segmentRepository.softDeleteByFileIdTransactional(
          queryRunner,
          file.id
        )
        await this.segmentRepository.createManyTransactional(
          queryRunner,
          segmentsWithIds.map((s, idx) => {
            const segmentFileName = `cropped_${baseName}_image_${s.id}.jpg`
            const segType = s.type ?? SegmentType.GENERATED
            return {
              id: s.id,
              label: s.label,
              labelType: s.labelType,
              boundingBox: s.boundingBox,
              confidence: s.confidence ?? 1,
              type: segType,
              humanModified: segType === SegmentType.MANUAL,
              originalPath: path.join(file.id, 'original', segmentFileName),
              modifiedPath: path.join(file.id, 'modified', segmentFileName),
              order: idx,
              fileId: file.id,
              modelRunId:
                segType === SegmentType.MANUAL ? null : (s.modelRunId ?? null),
            }
          })
        )

        await queryRunner.manager.update(
          FileEntity,
          { id: file.id },
          { status: FileStatus.SEGMENTED }
        )
      })

      await this.activityService
        .recordManualOperation({
          fileId: file.id,
          userId,
          operation: ActivityOperation.SEGMENTS_CROP,
          metadata: { segmentIds: segmentsWithIds.map(s => s.id) },
        })
        .catch(e => this.logger.error(`Activity log failed: ${e.message}`))

      return {
        success: true,
        message: status.messageText ?? 'Segments cropped successfully.',
        fileId: file.id,
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err
      throw new BadRequestException('Failed to crop segments.')
    }
  }

  async adjustSegment(
    data: AdjustSegmentDto,
    userId: string
  ): Promise<AdjustSegmentResultDto> {
    const { segmentId, brightness, contrast, sharpness } = data
    const segment = await this.segmentRepository.findOneById(segmentId)
    if (!segment) {
      throw new NotFoundException('Segment not found.')
    }

    const modifiedAbsPath = path.join(this.segmentsPath, segment.modifiedPath)

    const scriptPath = path.join(
      this.scriptDir,
      'app',
      'image_processing',
      'adjust_all.py'
    )

    try {
      const result = (await this.aiService.runScript(
        'python',
        [
          scriptPath,
          segmentId,
          modifiedAbsPath,
          String(brightness),
          String(contrast),
          String(sharpness),
          modifiedAbsPath,
        ],
        {
          env: {
            ...process.env,
            PATH: `${this.condaEnv}/bin:${process.env.PATH ?? ''}`,
          },
        }
      )) as string

      const parsed = JSON.parse(result.trim()) as {
        status?: { success?: boolean; messageText?: string }
      }
      const status = parsed?.status
      if (!status?.success) {
        throw new BadRequestException(
          status?.messageText || 'Failed to adjust segment.'
        )
      }

      await this.segmentRepository.updateChanged(segmentId, true)
      await this.segmentRepository.updateHumanModified(segmentId, true)

      await this.activityService
        .recordManualOperation({
          fileId: segment.fileId,
          userId,
          operation: ActivityOperation.SEGMENT_RESHAPE,
          segmentId: segment.id,
          metadata: { brightness, contrast, sharpness },
        })
        .catch(e => this.logger.error(`Activity log failed: ${e.message}`))

      return {
        success: true,
        message: status.messageText ?? 'Segment adjusted successfully.',
        outputPath: segment.modifiedPath,
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err
      throw new BadRequestException('Failed to adjust segment.')
    }
  }

  async revertSegmentation(
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

    const existingSegments = await this.segmentRepository.findByFileId(file.id)
    const deletedSegmentCount = existingSegments.length

    await runInTransaction(this.dataSource, async queryRunner => {
      await this.ocrResultRepository.softDeleteByFileIdTransactional(
        queryRunner,
        file.id
      )
      await this.postOcrCorrectionResultRepository.softDeleteByFileIdTransactional(
        queryRunner,
        file.id
      )
      await this.segmentRepository.softDeleteByFileIdTransactional(
        queryRunner,
        file.id
      )

      await queryRunner.manager.update(
        FileEntity,
        { id: file.id },
        { status: FileStatus.INITIALIZED }
      )
    })

    await this.activityService
      .recordManualOperation({
        fileId: file.id,
        userId,
        operation: ActivityOperation.LAYOUT_IDENTIFICATION_REVERT,
        metadata: { deletedSegmentCount },
      })
      .catch(e => this.logger.error(`Activity log failed: ${e.message}`))

    return { success: true }
  }

  async revertSegment(
    segmentId: string,
    userId: string
  ): Promise<{ success: boolean }> {
    const segment = await this.segmentRepository.findOneById(segmentId)
    if (!segment) {
      throw new NotFoundException('Segment not found.')
    }

    if (!segment.changed) {
      return { success: true }
    }

    const originalAbsPath = path.join(this.segmentsPath, segment.originalPath)
    const modifiedAbsPath = path.join(this.segmentsPath, segment.modifiedPath)

    await fs.promises.copyFile(originalAbsPath, modifiedAbsPath)
    await this.segmentRepository.updateChanged(segmentId, false)

    if (segment.type === SegmentType.GENERATED) {
      await this.segmentRepository.updateHumanModified(segmentId, false)
    }

    await this.activityService
      .recordManualOperation({
        fileId: segment.fileId,
        userId,
        operation: ActivityOperation.SEGMENT_REVERT,
        segmentId: segment.id,
        metadata: {},
      })
      .catch(e => this.logger.error(`Activity log failed: ${e.message}`))

    return { success: true }
  }

  async processModel(id: string, data: SegmentModelProcessDto) {
    const model = SEGMENT_MANAGEMENT_MODELS.find(m => m.id === id)
    if (!model) {
      throw new NotFoundException('Model not found.')
    }
    if (!model.path) {
      throw new ForbiddenException('Model is not executable.')
    }

    const { segmentId } = data
    const segment = await this.segmentRepository.findOneById(segmentId)
    if (!segment) {
      throw new NotFoundException('Segment not found.')
    }

    const modifiedAbsPath = path.join(this.segmentsPath, segment.modifiedPath)

    const scriptPath = path.join(this.scriptDir, model.path)

    try {
      const result = (await this.aiService.runScript(
        'python',
        [scriptPath, segmentId, modifiedAbsPath, modifiedAbsPath],
        {
          env: {
            ...process.env,
            PATH: `${this.condaEnv}/bin:${process.env.PATH ?? ''}`,
          },
        }
      )) as string

      const parsed = JSON.parse(result.trim()) as {
        status?: { success?: boolean; messageText?: string }
      }
      const status = parsed?.status
      if (!status?.success) {
        throw new BadRequestException(
          status?.messageText || 'Failed to process segment.'
        )
      }

      await this.segmentRepository.updateChanged(segmentId, true)

      return {
        success: true,
        message: status.messageText ?? 'Segment processed successfully.',
        outputPath: segment.modifiedPath,
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err
      throw new BadRequestException('Failed to process segment.')
    }
  }
}

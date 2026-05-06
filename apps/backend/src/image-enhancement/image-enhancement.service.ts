import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import * as path from 'path'
import * as fs from 'fs'
import { PathService } from 'src/common/services'
import { ModelProcessDto, ModelProcessingResultDto } from './dto'
import { AiService } from 'src/ai/ai.service'
import { DirectoryService } from 'src/directory/directory.service'
import { FileService } from 'src/file/file.service'
import { DirectoryEntryType } from 'src/file-manager/types'
import { ActivityService } from 'src/activity/activity.service'
import {
  ActivityOperation,
  ActivityStatus,
  AiActivityModelType,
} from 'src/activity/enums'
import { ImageEnhancementModelRepository } from './image-enhancement-model.repository'
import { ImageEnhancementModelType } from './types/image-enhancement-model-type.enum'

@Injectable()
export class ImageEnhancementService {
  private readonly logger = new Logger(ImageEnhancementService.name)

  constructor(
    @Inject('SCRIPT_DIR') private readonly scriptDir: string,
    @Inject('ROOT_PATH_SERVICE') private readonly pathService: PathService,
    @Inject('ORIGINALS_PATH_SERVICE')
    private readonly originalsPathService: PathService,
    @Inject('CONDA_ENV') private readonly condaEnv: string,
    private readonly aiService: AiService,
    private readonly directoryService: DirectoryService,
    private readonly fileService: FileService,
    private readonly modelRepository: ImageEnhancementModelRepository,
    private readonly activityService: ActivityService
  ) {}

  async processModel(
    id: string,
    data: ModelProcessDto,
    userId: string
  ): Promise<ModelProcessingResultDto> {
    const model = await this.modelRepository.findById(id)
    if (!model) throw new NotFoundException('Model not found.')
    if (model.type === ImageEnhancementModelType.HUGGINGFACE) {
      throw new BadRequestException('Model is not executable yet')
    }
    if (!model.reference) {
      throw new ForbiddenException('Model is not executable.')
    }

    const { inputDir, fileName, outputDir } = data

    const directory = await this.directoryService.resolveByPath(inputDir)
    const file = await this.fileService.findOne({
      name: fileName,
      directoryId: directory?.id ?? null,
    })
    if (!file) {
      throw new NotFoundException('File not found.')
    }

    const activity = await this.activityService.startModelRun({
      fileId: file.id,
      userId,
      modelType: AiActivityModelType.IMAGE_ENHANCEMENT,
      modelId: id,
      operation: ActivityOperation.IMAGE_ENHANCEMENT,
      modelRunId: data.modelRunId ?? null,
    })

    let activityStatus: ActivityStatus.SUCCESS | ActivityStatus.FAILURE =
      ActivityStatus.FAILURE
    let exitCode: number | null = null
    let errorMessage: string | null = null
    let metadata: Record<string, unknown> | null = null
    const startTime = Date.now()

    try {
      const inputPathAbsolute = this.pathService.buildAbsolutePath(
        inputDir,
        fileName
      )
      const imageId = path.basename(fileName, path.extname(fileName))
      const outputPathAbsolute = this.pathService.buildAbsolutePath(
        outputDir,
        fileName
      )
      const outputDirAbsolute = this.pathService.getAbsolutePath(outputDir)
      fs.mkdirSync(outputDirAbsolute, { recursive: true })

      let result: ModelProcessingResultDto
      try {
        const scriptPath = path.join(this.scriptDir, model.reference)
        const scriptResult = (await this.aiService.runScript(
          'python',
          [scriptPath, imageId, inputPathAbsolute, outputPathAbsolute],
          {
            env: {
              ...process.env,
              PATH: `${this.condaEnv}/bin:${process.env.PATH ?? ''}`,
            },
          }
        )) as string

        const parsed = JSON.parse(scriptResult.trim()) as {
          status?: { success?: boolean; messageText?: string }
        }
        const status = parsed?.status
        if (!status?.success) {
          throw new BadRequestException(
            status?.messageText || `Failed to process image.`
          )
        }
        file.imageModified = true
        await this.fileService.save(file)
        result = {
          success: true,
          message: status.messageText ?? `Image successfully processed.`,
          outputPath: this.pathService.buildRelativePath(outputDir, fileName),
        }
      } catch (err) {
        if (err instanceof BadRequestException) throw err
        throw new BadRequestException('Failed to process image.')
      }

      metadata = {
        ...((this.aiService.readExitStatus() as Record<
          string,
          unknown
        > | null) ?? {}),
        confidence: null,
      }
      activityStatus = ActivityStatus.SUCCESS
      exitCode = 0
      return result
    } catch (err) {
      errorMessage = (err as Error).message
      exitCode = (err as { code?: number }).code ?? null
      metadata = {
        ...((this.aiService.readExitStatus() as Record<
          string,
          unknown
        > | null) ?? {}),
        confidence: null,
      }
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

    const originalFileName = `${file.id}${file.extension}`

    if (
      !this.originalsPathService.isPathExists(
        originalFileName,
        DirectoryEntryType.FILE
      )
    ) {
      throw new UnprocessableEntityException('Original file not found on disk')
    }

    const originalAbsPath =
      this.originalsPathService.getAbsolutePath(originalFileName)
    const modifiedAbsPath = this.pathService.buildAbsolutePath(
      inputDir,
      fileName
    )

    await fs.promises.copyFile(originalAbsPath, modifiedAbsPath)

    file.imageModified = false
    file.humanModified = false
    await this.fileService.save(file)

    await this.activityService
      .recordManualOperation({
        fileId: file.id,
        userId,
        operation: ActivityOperation.IMAGE_ENHANCEMENT_REVERT,
        metadata: {},
      })
      .catch(e => this.logger.error(`Activity log failed: ${e.message}`))

    return { success: true }
  }
}

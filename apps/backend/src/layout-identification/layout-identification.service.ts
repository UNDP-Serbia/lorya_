import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import * as path from 'path'
import { PathService } from 'src/common/services'
import { ModelProcessDto, ModelProcessingResultDto, SegmentDto } from './dto'
import { AiService } from 'src/ai/ai.service'
import { DirectoryService } from 'src/directory/directory.service'
import { FileService } from 'src/file/file.service'
import { ActivityService } from 'src/activity/activity.service'
import {
  ActivityOperation,
  ActivityStatus,
  AiActivityModelType,
} from 'src/activity/enums'
import { LayoutIdentificationModelRepository } from './layout-identification-model.repository'
import { LayoutIdentificationModelType } from './types/layout-identification-model-type.enum'

@Injectable()
export class LayoutIdentificationService {
  private readonly logger = new Logger(LayoutIdentificationService.name)

  constructor(
    @Inject('SCRIPT_DIR') private readonly scriptDir: string,
    @Inject('ROOT_PATH_SERVICE') private readonly pathService: PathService,
    @Inject('CONDA_ENV') private readonly condaEnv: string,
    private readonly aiService: AiService,
    private readonly modelRepository: LayoutIdentificationModelRepository,
    private readonly directoryService: DirectoryService,
    private readonly fileService: FileService,
    private readonly activityService: ActivityService
  ) {}

  async processModel(
    id: string,
    data: ModelProcessDto,
    userId: string
  ): Promise<ModelProcessingResultDto> {
    const model = await this.modelRepository.findById(id)
    if (!model) throw new NotFoundException('Model not found.')
    if (model.type === LayoutIdentificationModelType.HUGGINGFACE) {
      throw new BadRequestException('Model is not executable yet')
    }
    if (!model.reference) {
      throw new ForbiddenException('Model is not executable.')
    }

    const { inputDir, fileName } = data

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
      modelType: AiActivityModelType.LAYOUT_IDENTIFICATION,
      modelId: id,
      operation: ActivityOperation.LAYOUT_IDENTIFICATION,
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

      let result: ModelProcessingResultDto
      try {
        const scriptPath = path.join(this.scriptDir, model.reference)
        const scriptResult = (await this.aiService.runScript(
          'python',
          [scriptPath, imageId, inputPathAbsolute],
          {
            env: {
              ...process.env,
              PATH: `${this.condaEnv}/bin:${process.env.PATH ?? ''}`,
            },
          }
        )) as string

        const parsed = JSON.parse(scriptResult.trim()) as {
          status?: { success?: boolean; messageText?: string }
          segments?: SegmentDto[]
        }
        const status = parsed?.status
        if (!status?.success) {
          throw new BadRequestException(
            status?.messageText || 'Failed to process image.'
          )
        }

        result = {
          success: true,
          message: status.messageText ?? 'Image is successfully segmented.',
          segments: parsed.segments ?? [],
        }
      } catch (err) {
        if (err instanceof BadRequestException) throw err
        this.logger.error('Process model failed', err)
        throw new BadRequestException('Failed to process image.')
      }

      const scored = result.segments.filter(
        (s): s is typeof s & { confidence: number } =>
          typeof s.confidence === 'number'
      )
      const avgConfidence =
        scored.length > 0
          ? scored.reduce((sum, s) => sum + s.confidence, 0) / scored.length
          : null
      metadata = {
        ...((this.aiService.readExitStatus() as Record<
          string,
          unknown
        > | null) ?? {}),
        confidence: avgConfidence,
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
}

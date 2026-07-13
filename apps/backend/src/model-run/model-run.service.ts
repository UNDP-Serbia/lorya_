import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectMapper } from '@automapper/nestjs'
import { Mapper } from '@automapper/core'
import { In } from 'typeorm'
import { ActivityEntity } from '../activity/activity.entity'
import { ActivityRepository } from '../activity/activity.repository'
import { ActivityStatus, AiActivityModelType } from '../activity/enums'
import { ImageEnhancementModelRepository } from '../image-enhancement/image-enhancement-model.repository'
import { LayoutIdentificationModelRepository } from '../layout-identification/layout-identification-model.repository'
import { OcrModelRepository } from '../ocr/ocr-model.repository'
import { OcrResultEntity } from '../ocr/ocr-result.entity'
import { OcrResultRepository } from '../ocr/ocr-result.repository'
import { PostOcrCorrectionModelRepository } from '../post-ocr-correction/post-ocr-correction-model.repository'
import { PostOcrCorrectionResultEntity } from '../post-ocr-correction/post-ocr-correction-result.entity'
import { PostOcrCorrectionResultRepository } from '../post-ocr-correction/post-ocr-correction-result.repository'
import { SegmentEntity } from '../segment-management/segment.entity'
import { SegmentRepository } from '../segment-management/segment.repository'
import {
  ModelRunListItemDto,
  ModelRunListQueryDto,
  ModelRunListResponseDto,
  ModelRunSegmentDto,
} from './dto'
import type { RunHistoryStatus } from './dto/model-run-segment.dto'
import {
  aggregateConfidence as aggregateConfidenceHelper,
  computeResultStatus,
  mapActivityStatusToFrontend,
} from './helpers'
import { ModelRunEntity } from './model-run.entity'
import { ModelRunRepository } from './model-run.repository'

type EnrichedActivity = ActivityEntity & {
  fileName: string
  fileStatus: RunHistoryStatus
  fileConfidence: number | null
  hasSegments: boolean
}

@Injectable()
export class ModelRunService {
  private readonly logger = new Logger(ModelRunService.name)
  private static readonly START_RETRY_LIMIT = 3

  constructor(
    private readonly repository: ModelRunRepository,
    private readonly ocrModelRepo: OcrModelRepository,
    private readonly layoutModelRepo: LayoutIdentificationModelRepository,
    private readonly enhancementModelRepo: ImageEnhancementModelRepository,
    private readonly postOcrModelRepo: PostOcrCorrectionModelRepository,
    private readonly activityRepository: ActivityRepository,
    private readonly ocrResultRepository: OcrResultRepository,
    private readonly postOcrResultRepository: PostOcrCorrectionResultRepository,
    private readonly segmentRepository: SegmentRepository,
    @InjectMapper() private readonly mapper: Mapper
  ) {}

  async start(input: {
    userId: string
    modelType: AiActivityModelType
    modelId: string
    selectionCount: number
  }): Promise<ModelRunEntity> {
    if (input.selectionCount < 1) {
      throw new BadRequestException('selectionCount must be >= 1')
    }

    const modelRepo = this.modelRepoFor(input.modelType)
    const model = await modelRepo.findById(input.modelId)
    if (!model) {
      throw new NotFoundException(
        `Model ${input.modelId} of type ${input.modelType} not found`
      )
    }

    for (
      let attempt = 0;
      attempt < ModelRunService.START_RETRY_LIMIT;
      attempt++
    ) {
      try {
        const maxRunId = await this.repository.findMaxRunIdForModel(
          input.modelType,
          input.modelId
        )
        const entity = this.repository.create({
          userId: input.userId,
          modelType: input.modelType,
          modelId: input.modelId,
          runId: maxRunId + 1,
          selectionCount: input.selectionCount,
          executionStatus: ActivityStatus.IN_PROGRESS,
          resultStatus: null,
          aggregateConfidence: null,
          startedAt: new Date(),
          finishedAt: null,
          durationMs: null,
          errorMessage: null,
        })
        return await this.repository.save(entity)
      } catch (err) {
        const message = (err as Error).message ?? ''
        const isUniqueViolation =
          message.includes('uq_model_run_seq') ||
          (err as { code?: string }).code === '23505'
        if (!isUniqueViolation) throw err
        this.logger.warn(
          `start() runId race for model ${input.modelId}, retry ${attempt + 1}`
        )
      }
    }
    throw new ConflictException(
      `Could not allocate runId for model ${input.modelId} after ${ModelRunService.START_RETRY_LIMIT} attempts`
    )
  }

  async complete(modelRunId: string): Promise<ModelRunEntity> {
    const run = await this.repository.findById(modelRunId)
    if (!run) {
      throw new NotFoundException(`ModelRun ${modelRunId} not found`)
    }
    if (run.finishedAt) {
      throw new ConflictException(`ModelRun ${modelRunId} is already completed`)
    }

    const activities = await this.activityRepository.raw.find({
      where: { modelRunId },
    })

    const inProgress = activities.filter(
      a => a.status === ActivityStatus.IN_PROGRESS
    )
    if (inProgress.length > 0) {
      throw new BadRequestException(
        `Cannot complete: ${inProgress.length} child activities still IN_PROGRESS`
      )
    }

    const childStatuses = activities.map(a => a.status)
    const resultStatus = computeResultStatus(childStatuses)

    const fileConfidences = await this.computeFileConfidences(
      run.modelType,
      run.id,
      activities
    )
    const aggregate = aggregateConfidenceHelper(fileConfidences)

    const now = new Date()
    const durationMs = now.getTime() - run.startedAt.getTime()
    const isEmpty = activities.length === 0
    const executionStatus = isEmpty
      ? ActivityStatus.FAILURE
      : ActivityStatus.SUCCESS
    const errorMessage = isEmpty
      ? 'No child activities recorded — run completed without processing any files'
      : run.errorMessage

    await this.repository.update(modelRunId, {
      executionStatus,
      resultStatus,
      aggregateConfidence: aggregate,
      finishedAt: now,
      durationMs,
      errorMessage,
    })

    Object.assign(run, {
      executionStatus,
      resultStatus,
      aggregateConfidence: aggregate,
      finishedAt: now,
      durationMs,
      errorMessage,
    })
    return run
  }

  async list(query: ModelRunListQueryDto): Promise<ModelRunListResponseDto> {
    const page = query.page ?? 1
    const limit = query.limit ?? 50

    const qb = this.repository.raw
      .createQueryBuilder('mr')
      .leftJoinAndSelect('mr.user', 'user')

    if (query.modelType) {
      qb.andWhere('mr.modelType = :modelType', { modelType: query.modelType })
    }
    if (query.modelId) {
      qb.andWhere('mr.modelId = :modelId', { modelId: query.modelId })
    }
    if (query.userId) {
      qb.andWhere('mr.userId = :userId', { userId: query.userId })
    }
    if (query.resultStatus) {
      qb.andWhere('mr.resultStatus = :resultStatus', {
        resultStatus: query.resultStatus,
      })
    }
    if (query.from) {
      qb.andWhere('mr.createdAt >= :from', { from: query.from })
    }
    if (query.to) {
      qb.andWhere('mr.createdAt <= :to', { to: query.to })
    }
    if (query.directoryId) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM activity a
          INNER JOIN files f ON f.id = a."fileId"
          WHERE a."modelRunId" = mr.id AND f."directoryId" = :directoryId
        )`,
        { directoryId: query.directoryId }
      )
    }

    qb.orderBy('mr.createdAt', 'DESC')
    qb.skip((page - 1) * limit)
    qb.take(limit)

    const [runs, total] = await qb.getManyAndCount()
    if (runs.length === 0) {
      return {
        generatedAt: new Date().toISOString(),
        total,
        page,
        limit,
        items: [],
      }
    }

    // Batch-load all child activities for the page
    const runIds = runs.map(r => r.id)
    const allActivities = await this.activityRepository.raw.find({
      where: { modelRunId: In(runIds) },
      relations: { file: true },
    })

    // Group by run
    const activitiesByRun = new Map<string, ActivityEntity[]>()
    for (const a of allActivities) {
      if (!a.modelRunId) continue
      const list = activitiesByRun.get(a.modelRunId) ?? []
      list.push(a)
      activitiesByRun.set(a.modelRunId, list)
    }

    // Resolve modelName and modelKind once per (modelType, modelId)
    const { nameByKey, kindByKey } = await this.resolveModelMeta(runs)

    // Compute file confidence + status + hasSegments per activity (batch)
    const enrichedActivitiesByRun = await this.enrichActivitiesByRun(
      runs,
      activitiesByRun
    )

    const enrichedRuns = runs.map(run => {
      const runActivities = enrichedActivitiesByRun.get(run.id) ?? []
      const metaKey = `${run.modelType}:${run.modelId}`
      return Object.assign(run, {
        modelName: nameByKey.get(metaKey) ?? '',
        modelKind: kindByKey.get(metaKey) ?? null,
        activities: runActivities,
      })
    })

    const items = this.mapper.mapArray(
      enrichedRuns,
      ModelRunEntity,
      ModelRunListItemDto
    )

    return {
      generatedAt: new Date().toISOString(),
      total,
      page,
      limit,
      items,
    }
  }

  async getSegments(
    modelRunId: string,
    fileId: string
  ): Promise<ModelRunSegmentDto[]> {
    const run = await this.repository.findById(modelRunId)
    if (!run) {
      throw new NotFoundException(`ModelRun ${modelRunId} not found`)
    }

    const activity = await this.activityRepository.raw.findOne({
      where: { modelRunId, fileId },
    })
    if (!activity) {
      throw new NotFoundException(
        `Activity for run ${modelRunId} and file ${fileId} not found`
      )
    }

    if (
      run.modelType !== AiActivityModelType.OCR &&
      run.modelType !== AiActivityModelType.POST_OCR_CORRECTION
    ) {
      return []
    }

    // withDeleted to include segments that were soft-deleted by a later cropSegments
    const segments = await this.segmentRepository.raw.find({
      where: { fileId },
      withDeleted: true,
      order: { order: 'ASC' },
    })
    if (segments.length === 0) return []

    const segmentIds = segments.map(s => s.id)
    const segmentById = new Map(segments.map(s => [s.id, s]))

    if (run.modelType === AiActivityModelType.OCR) {
      const results =
        await this.ocrResultRepository.findBySegmentIdsAndModelRunId(
          segmentIds,
          modelRunId
        )
      const enriched = results.map(r => {
        const segment = segmentById.get(r.segmentId)
        return Object.assign(r, {
          segmentNumber: segment?.order ?? 0,
          segmentLabel: segment?.label ?? '',
          segmentFrontendStatus: mapActivityStatusToFrontend(activity.status),
          confidencePercent:
            r.avgWordConfidence !== null && r.avgWordConfidence !== undefined
              ? Math.round(r.avgWordConfidence * 100)
              : null,
        })
      })
      return this.mapper.mapArray(enriched, OcrResultEntity, ModelRunSegmentDto)
    }

    // POST_OCR_CORRECTION
    const results =
      await this.postOcrResultRepository.findBySegmentIdsAndModelRunId(
        segmentIds,
        modelRunId
      )
    const enriched = results.map(r => {
      const segment = segmentById.get(r.segmentId)
      return Object.assign(r, {
        segmentNumber: segment?.order ?? 0,
        segmentLabel: segment?.label ?? '',
        segmentFrontendStatus: mapActivityStatusToFrontend(activity.status),
        confidencePercent:
          r.avgWordConfidence !== null && r.avgWordConfidence !== undefined
            ? Math.round(r.avgWordConfidence * 100)
            : null,
      })
    })
    return this.mapper.mapArray(
      enriched,
      PostOcrCorrectionResultEntity,
      ModelRunSegmentDto
    )
  }

  private async computeFileConfidences(
    modelType: AiActivityModelType,
    modelRunId: string,
    activities: ActivityEntity[]
  ): Promise<(number | null)[]> {
    if (activities.length === 0) return []

    const fileIds = activities.map(a => a.fileId)

    if (modelType === AiActivityModelType.OCR) {
      const segments = await this.segmentRepository.raw.find({
        where: { fileId: In(fileIds) },
        withDeleted: true,
      })
      const segmentIds = segments.map(s => s.id)
      const ocrResults =
        await this.ocrResultRepository.findBySegmentIdsAndModelRunId(
          segmentIds,
          modelRunId
        )
      return activities.map(a => {
        const fileSegmentIds = segments
          .filter(s => s.fileId === a.fileId)
          .map(s => s.id)
        const fileResults = ocrResults.filter(r =>
          fileSegmentIds.includes(r.segmentId)
        )
        if (fileResults.length === 0) return null
        const avg =
          fileResults.reduce((sum, r) => sum + r.avgWordConfidence, 0) /
          fileResults.length
        return Math.round(avg * 100)
      })
    }

    if (modelType === AiActivityModelType.POST_OCR_CORRECTION) {
      const segments = await this.segmentRepository.raw.find({
        where: { fileId: In(fileIds) },
        withDeleted: true,
      })
      const segmentIds = segments.map(s => s.id)
      const postOcrResults =
        await this.postOcrResultRepository.findBySegmentIdsAndModelRunId(
          segmentIds,
          modelRunId
        )
      return activities.map(a => {
        const fileSegmentIds = segments
          .filter(s => s.fileId === a.fileId)
          .map(s => s.id)
        const fileResults = postOcrResults.filter(r =>
          fileSegmentIds.includes(r.segmentId)
        )
        if (fileResults.length === 0) return null
        const avg =
          fileResults.reduce((sum, r) => sum + r.avgWordConfidence, 0) /
          fileResults.length
        return Math.round(avg * 100)
      })
    }

    // For Image Enhancement and Layout Identification: read from
    // Activity.metadata.confidence
    return activities.map(a => {
      const meta = a.metadata as { confidence?: unknown } | null
      const value = meta?.confidence
      return typeof value === 'number' && Number.isFinite(value)
        ? Math.round(value)
        : null
    })
  }

  private async resolveModelMeta(runs: ModelRunEntity[]): Promise<{
    nameByKey: Map<string, string>
    kindByKey: Map<string, string>
  }> {
    const byType = new Map<AiActivityModelType, Set<string>>()
    for (const run of runs) {
      if (!byType.has(run.modelType)) byType.set(run.modelType, new Set())
      byType.get(run.modelType)!.add(run.modelId)
    }
    const nameByKey = new Map<string, string>()
    const kindByKey = new Map<string, string>()
    for (const [type, ids] of byType) {
      const repo = this.modelRepoFor(type)
      const found = await repo.findByIds([...ids])
      for (const m of found as Array<{
        id: string
        name: string
        type: string
      }>) {
        const key = `${type}:${m.id}`
        nameByKey.set(key, m.name)
        kindByKey.set(key, m.type)
      }
    }
    return { nameByKey, kindByKey }
  }

  private async enrichActivitiesByRun(
    runs: ModelRunEntity[],
    activitiesByRun: Map<string, ActivityEntity[]>
  ): Promise<Map<string, EnrichedActivity[]>> {
    const result = new Map<string, EnrichedActivity[]>()

    for (const run of runs) {
      const activities = activitiesByRun.get(run.id) ?? []

      const fileConfidences = await this.computeFileConfidences(
        run.modelType,
        run.id,
        activities
      )

      const fileIds = activities.map(a => a.fileId)
      const segmentsByFile = await this.loadSegmentsByFileForRun(
        run.modelType,
        fileIds
      )

      const enriched: EnrichedActivity[] = activities.map((a, idx) => {
        const fileSegments = segmentsByFile.get(a.fileId) ?? []
        const hasSegments =
          (run.modelType === AiActivityModelType.OCR ||
            run.modelType === AiActivityModelType.POST_OCR_CORRECTION) &&
          fileSegments.length > 0

        const fileStatus: RunHistoryStatus = mapActivityStatusToFrontend(
          a.status
        )

        return Object.assign(a, {
          fileName: a.file?.name ?? '',
          fileStatus,
          fileConfidence: fileConfidences[idx] ?? null,
          hasSegments,
        })
      })

      result.set(run.id, enriched)
    }
    return result
  }

  private async loadSegmentsByFileForRun(
    modelType: AiActivityModelType,
    fileIds: string[]
  ): Promise<Map<string, SegmentEntity[]>> {
    const result = new Map<string, SegmentEntity[]>()
    if (
      modelType !== AiActivityModelType.OCR &&
      modelType !== AiActivityModelType.POST_OCR_CORRECTION
    ) {
      return result
    }
    if (fileIds.length === 0) return result
    const segments = await this.segmentRepository.raw.find({
      where: { fileId: In(fileIds) },
      withDeleted: true,
      order: { order: 'ASC' },
    })
    for (const s of segments) {
      const list = result.get(s.fileId) ?? []
      list.push(s)
      result.set(s.fileId, list)
    }
    return result
  }

  private modelRepoFor(type: AiActivityModelType) {
    switch (type) {
      case AiActivityModelType.LAYOUT_IDENTIFICATION:
        return this.layoutModelRepo
      case AiActivityModelType.IMAGE_ENHANCEMENT:
        return this.enhancementModelRepo
      case AiActivityModelType.OCR:
        return this.ocrModelRepo
      case AiActivityModelType.POST_OCR_CORRECTION:
        return this.postOcrModelRepo
      default: {
        const exhaustiveCheck: never = type
        throw new Error(
          `Unhandled AiActivityModelType: ${exhaustiveCheck as string}`
        )
      }
    }
  }
}

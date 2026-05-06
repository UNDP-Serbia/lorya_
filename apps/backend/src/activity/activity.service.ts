import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ActivityRepository } from './activity.repository'
import { ActivityEntity } from './activity.entity'
import {
  ActivityCategory,
  ActivityOperation,
  ActivityStatus,
  AiActivityModelType,
} from './enums'
import { OcrModelRepository } from 'src/ocr/ocr-model.repository'
import { LayoutIdentificationModelRepository } from 'src/layout-identification/layout-identification-model.repository'
import { ImageEnhancementModelRepository } from 'src/image-enhancement/image-enhancement-model.repository'
import { PostOcrCorrectionModelRepository } from 'src/post-ocr-correction/post-ocr-correction-model.repository'

export type EnrichedActivity = ActivityEntity & { modelName: string | null }

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name)

  constructor(
    private readonly repository: ActivityRepository,
    private readonly ocrModelRepo: OcrModelRepository,
    private readonly layoutModelRepo: LayoutIdentificationModelRepository,
    private readonly enhancementModelRepo: ImageEnhancementModelRepository,
    private readonly postOcrModelRepo: PostOcrCorrectionModelRepository
  ) {}

  async startModelRun(input: {
    fileId: string
    userId: string
    modelType: AiActivityModelType
    modelId: string
    operation: ActivityOperation
    modelRunId?: string | null
  }): Promise<ActivityEntity> {
    const now = new Date()
    const entity = this.repository.create({
      fileId: input.fileId,
      userId: input.userId,
      category: ActivityCategory.MODEL_RUN,
      operation: input.operation,
      status: ActivityStatus.IN_PROGRESS,
      modelType: input.modelType,
      modelId: input.modelId,
      modelRunId: input.modelRunId ?? null,
      startedAt: now,
      finishedAt: null,
    })
    return this.repository.save(entity)
  }

  async completeModelRun(input: {
    activityId: string
    status: ActivityStatus.SUCCESS | ActivityStatus.FAILURE
    exitCode: number | null
    errorMessage: string | null
    metadata: Record<string, unknown> | null
    durationMs: number
  }): Promise<void> {
    await this.repository.update(input.activityId, {
      status: input.status,
      exitCode: input.exitCode,
      errorMessage:
        input.errorMessage === null ? null : input.errorMessage.slice(0, 4096),
      metadata: input.metadata,
      durationMs: input.durationMs,
      finishedAt: new Date(),
    })
  }

  async recordManualOperation(input: {
    fileId: string
    userId: string
    operation: ActivityOperation
    segmentId?: string
    metadata?: Record<string, unknown>
  }): Promise<void> {
    const now = new Date()
    const entity = this.repository.create({
      fileId: input.fileId,
      userId: input.userId,
      category: ActivityCategory.MANUAL_OPERATION,
      operation: input.operation,
      status: ActivityStatus.SUCCESS,
      segmentId: input.segmentId ?? null,
      metadata: input.metadata ?? null,
      startedAt: now,
      finishedAt: now,
      durationMs: 0,
    })
    await this.repository.save(entity)
  }

  findByFileId(fileId: string): Promise<ActivityEntity[]> {
    return this.repository.raw.find({
      where: { fileId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    })
  }

  async listModelExecutions(filters: {
    modelType?: AiActivityModelType
    modelId?: string
    userId?: string
    fileId?: string
    directoryId?: string
    status?: ActivityStatus
    from?: string
    to?: string
  }): Promise<ActivityEntity[]> {
    const qb = this.repository.raw
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .where('activity.category = :category', {
        category: ActivityCategory.MODEL_RUN,
      })

    if (filters.modelType) {
      qb.andWhere('activity.modelType = :modelType', {
        modelType: filters.modelType,
      })
    }
    if (filters.modelId) {
      qb.andWhere('activity.modelId = :modelId', { modelId: filters.modelId })
    }
    if (filters.userId) {
      qb.andWhere('activity.userId = :userId', { userId: filters.userId })
    }
    if (filters.fileId) {
      qb.andWhere('activity.fileId = :fileId', { fileId: filters.fileId })
    }
    if (filters.directoryId) {
      qb.innerJoin(
        'files',
        'file',
        'file.id = activity.fileId AND file.directoryId = :directoryId',
        { directoryId: filters.directoryId }
      )
    }
    if (filters.status) {
      qb.andWhere('activity.status = :status', { status: filters.status })
    }
    if (filters.from) {
      qb.andWhere('activity.createdAt >= :from', { from: filters.from })
    }
    if (filters.to) {
      qb.andWhere('activity.createdAt <= :to', { to: filters.to })
    }

    qb.orderBy('activity.createdAt', 'DESC')
    return qb.getMany()
  }

  async findModelExecutionById(id: string): Promise<ActivityEntity> {
    const row = await this.repository.raw.findOne({
      where: { id, category: ActivityCategory.MODEL_RUN },
      relations: { user: true },
    })
    if (!row) {
      throw new NotFoundException('Model execution not found')
    }
    return row
  }

  async enrichWithModelNames(
    rows: ActivityEntity[]
  ): Promise<EnrichedActivity[]> {
    const byType = new Map<AiActivityModelType, Set<string>>()
    for (const row of rows) {
      if (!row.modelType || !row.modelId) continue
      if (!byType.has(row.modelType)) byType.set(row.modelType, new Set())
      byType.get(row.modelType)!.add(row.modelId)
    }

    const nameByKey = new Map<string, string>()
    for (const [type, ids] of byType) {
      const repo = this.modelRepoFor(type)
      const found = await repo.findByIds([...ids])
      for (const m of found as Array<{ id: string; name: string }>) {
        nameByKey.set(`${type}:${m.id}`, m.name)
      }
    }

    return rows.map(row => ({
      ...row,
      modelName:
        row.modelType && row.modelId
          ? (nameByKey.get(`${row.modelType}:${row.modelId}`) ?? null)
          : null,
    })) as EnrichedActivity[]
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
    }
  }
}

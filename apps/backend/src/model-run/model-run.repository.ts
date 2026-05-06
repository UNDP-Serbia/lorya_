import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AiActivityModelType } from '../activity/enums'
import { ModelRunEntity } from './model-run.entity'

@Injectable()
export class ModelRunRepository {
  constructor(
    @InjectRepository(ModelRunEntity)
    private readonly repo: Repository<ModelRunEntity>
  ) {}

  get raw(): Repository<ModelRunEntity> {
    return this.repo
  }

  create(partial: Partial<ModelRunEntity>): ModelRunEntity {
    return this.repo.create(partial)
  }

  save(entity: ModelRunEntity): Promise<ModelRunEntity> {
    return this.repo.save(entity)
  }

  async update(id: string, patch: Partial<ModelRunEntity>): Promise<void> {
    await this.repo.update({ id }, patch)
  }

  findById(id: string): Promise<ModelRunEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: { user: true },
    })
  }

  async findMaxRunIdForModel(
    modelType: AiActivityModelType,
    modelId: string
  ): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('mr')
      .select('MAX(mr.runId)', 'max')
      .where('mr.modelType = :modelType', { modelType })
      .andWhere('mr.modelId = :modelId', { modelId })
      .getRawOne<{ max: number | null }>()
    return result?.max ?? 0
  }
}

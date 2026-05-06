import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, IsNull, QueryRunner, Repository } from 'typeorm'
import { SegmentEntity } from './segment.entity'

@Injectable()
export class SegmentRepository {
  constructor(
    @InjectRepository(SegmentEntity)
    private readonly repository: Repository<SegmentEntity>
  ) {}

  get raw(): Repository<SegmentEntity> {
    return this.repository
  }

  findByFileId(fileId: string) {
    return this.repository.find({
      where: { fileId },
      order: { order: 'ASC' },
    })
  }

  findByFileIds(fileIds: string[]): Promise<SegmentEntity[]> {
    if (fileIds.length === 0) return Promise.resolve([])
    return this.repository.find({
      where: { fileId: In(fileIds) },
      order: { order: 'ASC' },
    })
  }

  findOneById(id: string) {
    return this.repository.findOne({ where: { id } })
  }

  findByModelRunId(modelRunId: string): Promise<SegmentEntity[]> {
    return this.repository.find({
      where: { modelRunId },
      withDeleted: true,
      order: { order: 'ASC' },
    })
  }

  findByFileIdsAndModelRunId(
    fileIds: string[],
    modelRunId: string
  ): Promise<SegmentEntity[]> {
    if (fileIds.length === 0) return Promise.resolve([])
    return this.repository.find({
      where: { fileId: In(fileIds), modelRunId },
      withDeleted: true,
      order: { order: 'ASC' },
    })
  }

  createManyTransactional(
    queryRunner: QueryRunner,
    data: Partial<SegmentEntity>[]
  ) {
    const entities = data.map(d => this.repository.create(d))
    return queryRunner.manager.save(SegmentEntity, entities)
  }

  updateChanged(id: string, changed: boolean) {
    return this.repository.update(id, { changed })
  }

  updateHumanModified(id: string, humanModified: boolean) {
    return this.repository.update(id, { humanModified })
  }

  softDeleteByFileId(fileId: string) {
    return this.repository.softDelete({ fileId, deletedAt: IsNull() })
  }

  softDeleteByFileIdTransactional(queryRunner: QueryRunner, fileId: string) {
    return queryRunner.manager.softDelete(SegmentEntity, {
      fileId,
      deletedAt: IsNull(),
    })
  }

  deleteByFileId(fileId: string) {
    return this.repository.delete({ fileId })
  }

  deleteByFileIdTransactional(queryRunner: QueryRunner, fileId: string) {
    return queryRunner.manager.delete(SegmentEntity, { fileId })
  }
}

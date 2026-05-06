import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, QueryRunner, Repository } from 'typeorm'
import { OcrResultEntity } from './ocr-result.entity'

@Injectable()
export class OcrResultRepository {
  constructor(
    @InjectRepository(OcrResultEntity)
    private readonly repository: Repository<OcrResultEntity>
  ) {}

  findBySegmentId(segmentId: string) {
    return this.repository.findOne({ where: { segmentId } })
  }

  findBySegmentIds(segmentIds: string[]): Promise<OcrResultEntity[]> {
    if (segmentIds.length === 0) return Promise.resolve([])
    return this.repository.find({ where: { segmentId: In(segmentIds) } })
  }

  findBySegmentIdsAndModelRunId(
    segmentIds: string[],
    modelRunId: string
  ): Promise<OcrResultEntity[]> {
    if (segmentIds.length === 0) return Promise.resolve([])
    return this.repository.find({
      where: { segmentId: In(segmentIds), modelRunId },
      withDeleted: true,
    })
  }

  findByModelRunId(modelRunId: string): Promise<OcrResultEntity[]> {
    return this.repository.find({
      where: { modelRunId },
      withDeleted: true,
    })
  }

  save(entity: OcrResultEntity) {
    return this.repository.save(entity)
  }

  findByFileId(fileId: string) {
    return this.repository
      .createQueryBuilder('ocr')
      .innerJoinAndSelect('ocr.segment', 'segment')
      .where('segment.fileId = :fileId', { fileId })
      .orderBy('segment.order', 'ASC')
      .getMany()
  }

  createManyTransactional(
    queryRunner: QueryRunner,
    data: Partial<OcrResultEntity>[]
  ) {
    const entities = data.map(d => this.repository.create(d))
    return queryRunner.manager.save(OcrResultEntity, entities)
  }

  softDeleteByFileId(fileId: string) {
    return this.repository
      .createQueryBuilder()
      .softDelete()
      .where('"deletedAt" IS NULL')
      .andWhere(
        '"segmentId" IN (SELECT id FROM segments WHERE "fileId" = :fileId AND "deletedAt" IS NULL)',
        { fileId }
      )
      .execute()
  }

  softDeleteByFileIdTransactional(queryRunner: QueryRunner, fileId: string) {
    return queryRunner.manager
      .createQueryBuilder()
      .softDelete()
      .from(OcrResultEntity)
      .where('"deletedAt" IS NULL')
      .andWhere(
        '"segmentId" IN (SELECT id FROM segments WHERE "fileId" = :fileId AND "deletedAt" IS NULL)',
        { fileId }
      )
      .execute()
  }

  deleteByFileId(fileId: string) {
    return this.repository
      .createQueryBuilder()
      .delete()
      .from(OcrResultEntity)
      .where(
        'segmentId IN (SELECT id FROM segments WHERE "fileId" = :fileId)',
        { fileId }
      )
      .execute()
  }

  deleteByFileIdTransactional(queryRunner: QueryRunner, fileId: string) {
    return queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from(OcrResultEntity)
      .where(
        'segmentId IN (SELECT id FROM segments WHERE "fileId" = :fileId)',
        { fileId }
      )
      .execute()
  }
}

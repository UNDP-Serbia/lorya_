import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryRunner, Repository, IsNull, In } from 'typeorm'
import { FileEntity } from './file.entity'

@Injectable()
export class FileRepository {
  constructor(
    @InjectRepository(FileEntity)
    private readonly repository: Repository<FileEntity>
  ) {}

  findAll() {
    return this.repository.find()
  }

  findByDirectoryId(directoryId: string | null) {
    return this.repository.find({
      where: { directoryId: directoryId ?? IsNull() },
    })
  }

  findOne(params: { id?: string; name?: string; directoryId?: string | null }) {
    const where: Record<string, unknown> = {}
    if (params.id) where.id = params.id
    if (params.name) where.name = params.name
    if (params.directoryId !== undefined) {
      where.directoryId =
        params.directoryId === null ? IsNull() : params.directoryId
    }
    return this.repository.findOne({ where })
  }

  create(data: Partial<FileEntity>) {
    return this.repository.save(this.repository.create(data))
  }

  createMany(data: Partial<FileEntity>[]) {
    return this.repository.save(data.map(d => this.repository.create(d)))
  }

  createManyTransactional(
    queryRunner: QueryRunner,
    data: Partial<FileEntity>[]
  ) {
    const entities = data.map(d => this.repository.create(d))
    return queryRunner.manager.save(FileEntity, entities)
  }

  save(data: Partial<FileEntity>) {
    return this.repository.save(data)
  }

  findByIds(ids: string[]) {
    return this.repository.find({
      where: { id: In(ids) },
    })
  }

  delete(id: string) {
    return this.repository.delete({ id })
  }
}

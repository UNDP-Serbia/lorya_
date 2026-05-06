import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull } from 'typeorm'
import { DirectoryEntity } from './directory.entity'

@Injectable()
export class DirectoryRepository {
  constructor(
    @InjectRepository(DirectoryEntity)
    private readonly repository: Repository<DirectoryEntity>
  ) {}

  findAll() {
    return this.repository.find()
  }

  findByParentId(parentId: string | null) {
    return this.repository.find({
      where: { parentId: parentId ?? IsNull() },
    })
  }

  findOne(params: { id?: string; name?: string; parentId?: string | null }) {
    const where: Record<string, unknown> = {}
    if (params.id) where.id = params.id
    if (params.name) where.name = params.name
    if (params.parentId !== undefined) {
      where.parentId = params.parentId === null ? IsNull() : params.parentId
    }
    return this.repository.findOne({ where })
  }

  async findByPath(segments: string[]): Promise<DirectoryEntity | null> {
    let currentParentId: string | null = null
    let currentDir: DirectoryEntity | null = null

    for (const segment of segments) {
      currentDir = await this.repository.findOne({
        where: {
          name: segment,
          parentId: currentParentId === null ? IsNull() : currentParentId,
        },
      })
      if (!currentDir) return null
      currentParentId = currentDir.id
    }
    return currentDir
  }

  create(data: Partial<DirectoryEntity>) {
    return this.repository.save(this.repository.create(data))
  }

  save(data: Partial<DirectoryEntity>) {
    return this.repository.save(data)
  }

  delete(id: string) {
    return this.repository.delete({ id })
  }
}

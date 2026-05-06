import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { ImageEnhancementModelEntity } from './image-enhancement-model.entity'

@Injectable()
export class ImageEnhancementModelRepository {
  constructor(
    @InjectRepository(ImageEnhancementModelEntity)
    private readonly repository: Repository<ImageEnhancementModelEntity>
  ) {}

  findAll() {
    return this.repository.find({
      order: { createdAt: 'ASC' },
      relations: ['uploadedBy'],
    })
  }

  findById(id: string) {
    return this.repository.findOne({
      where: { id },
      relations: ['uploadedBy'],
    })
  }

  findByIds(ids: string[]): Promise<ImageEnhancementModelEntity[]> {
    if (ids.length === 0) return Promise.resolve([])
    return this.repository.find({ where: { id: In(ids) } })
  }

  findByName(name: string) {
    return this.repository.findOne({ where: { name } })
  }

  create(data: Partial<ImageEnhancementModelEntity>) {
    const entity = this.repository.create(data)
    return this.repository.save(entity)
  }

  update(id: string, data: Partial<ImageEnhancementModelEntity>) {
    return this.repository.update(id, data)
  }

  delete(id: string) {
    return this.repository.delete(id)
  }
}

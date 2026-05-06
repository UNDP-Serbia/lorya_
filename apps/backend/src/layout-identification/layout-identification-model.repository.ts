import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { LayoutIdentificationModelEntity } from './layout-identification-model.entity'

@Injectable()
export class LayoutIdentificationModelRepository {
  constructor(
    @InjectRepository(LayoutIdentificationModelEntity)
    private readonly repository: Repository<LayoutIdentificationModelEntity>
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

  findByIds(ids: string[]): Promise<LayoutIdentificationModelEntity[]> {
    if (ids.length === 0) return Promise.resolve([])
    return this.repository.find({ where: { id: In(ids) } })
  }

  findByName(name: string) {
    return this.repository.findOne({ where: { name } })
  }

  create(data: Partial<LayoutIdentificationModelEntity>) {
    return this.repository.save(this.repository.create(data))
  }

  update(id: string, data: Partial<LayoutIdentificationModelEntity>) {
    return this.repository.update(id, data)
  }

  delete(id: string) {
    return this.repository.delete(id)
  }
}

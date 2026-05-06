import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ActivityEntity } from './activity.entity'

@Injectable()
export class ActivityRepository {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly repo: Repository<ActivityEntity>
  ) {}

  get raw(): Repository<ActivityEntity> {
    return this.repo
  }

  create(partial: Partial<ActivityEntity>): ActivityEntity {
    return this.repo.create(partial)
  }

  save(entity: ActivityEntity): Promise<ActivityEntity> {
    return this.repo.save(entity)
  }

  async update(id: string, patch: Partial<ActivityEntity>): Promise<void> {
    await this.repo.update({ id }, patch)
  }

  findById(id: string): Promise<ActivityEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: { user: true },
    })
  }
}

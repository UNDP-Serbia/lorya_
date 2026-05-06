import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity as TypeormBaseEntity,
} from 'typeorm'
import { AutoMap } from '@automapper/classes'

export class BaseEntity extends TypeormBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @AutoMap()
  id: string

  @CreateDateColumn()
  @AutoMap(() => Date)
  createdAt: Date

  @UpdateDateColumn()
  @AutoMap(() => Date)
  updatedAt: Date
}

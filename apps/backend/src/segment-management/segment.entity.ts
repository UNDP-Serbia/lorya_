import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm'
import { AutoMap } from '@automapper/classes'
import { BaseEntity } from '../common/base/entities/base.entity'
import { FileEntity } from '../file/file.entity'
import { ModelRunEntity } from '../model-run/model-run.entity'
import { LabelType } from '../layout-identification/dto'

export enum SegmentType {
  GENERATED = 'GENERATED',
  MANUAL = 'MANUAL',
}

@Entity('segments')
export class SegmentEntity extends BaseEntity {
  @Column()
  @AutoMap()
  label: string

  @Column({ type: 'enum', enum: LabelType })
  @AutoMap()
  labelType: LabelType

  @Column({ type: 'jsonb' })
  @AutoMap()
  boundingBox: { x1: number; y1: number; x2: number; y2: number }

  @Column()
  @AutoMap()
  originalPath: string

  @Column()
  @AutoMap()
  modifiedPath: string

  @Column({ type: 'float', default: 1 })
  @AutoMap()
  confidence: number

  @Column({ type: 'boolean', default: false })
  @AutoMap()
  changed: boolean

  @Column({
    type: 'enum',
    enum: SegmentType,
    default: SegmentType.GENERATED,
  })
  @AutoMap()
  type: SegmentType

  @Column({ type: 'boolean', default: false })
  @AutoMap()
  humanModified: boolean

  @Column({ type: 'integer' })
  @AutoMap()
  order: number

  @Column({ type: 'uuid' })
  @AutoMap()
  fileId: string

  @ManyToOne(() => FileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fileId' })
  file: FileEntity

  @Column({ type: 'uuid', nullable: true })
  @AutoMap()
  modelRunId: string | null

  @ManyToOne(() => ModelRunEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'modelRunId' })
  modelRun: ModelRunEntity | null

  @DeleteDateColumn({ nullable: true })
  @AutoMap(() => Date)
  deletedAt: Date | null
}

import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  DeleteDateColumn,
  Index,
} from 'typeorm'
import { AutoMap } from '@automapper/classes'
import { BaseEntity } from '../common/base/entities/base.entity'
import { SegmentEntity } from '../segment-management/segment.entity'
import { ModelRunEntity } from '../model-run/model-run.entity'
import { OcrLineDto } from './dto'

@Entity('ocr_results')
@Index('UQ_ocr_results_segment_active', ['segmentId'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
export class OcrResultEntity extends BaseEntity {
  @Column()
  @AutoMap()
  lang: string

  @Column()
  @AutoMap()
  script: string

  @Column({ type: 'float' })
  @AutoMap()
  avgWordConfidence: number

  @Column({ type: 'jsonb' })
  @AutoMap()
  lines: OcrLineDto[]

  @Column({ type: 'uuid' })
  @AutoMap()
  segmentId: string

  @OneToOne(() => SegmentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'segmentId' })
  segment: SegmentEntity

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

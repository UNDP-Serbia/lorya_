import { AutoMap } from '@automapper/classes'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base/entities/base.entity'
import { AccountEntity } from '../account/entities/account.entity'
import { FileEntity } from '../file/file.entity'
import { ModelRunEntity } from '../model-run/model-run.entity'
import { SegmentEntity } from '../segment-management/segment.entity'
import {
  ActivityCategory,
  ActivityOperation,
  ActivityStatus,
  AiActivityModelType,
} from './enums'

@Entity('activity')
@Index('idx_activity_file_created', ['fileId', 'createdAt'])
@Index('idx_activity_category_created', ['category', 'createdAt'])
@Index('idx_activity_user', ['userId'])
@Index('idx_activity_model', ['modelType', 'modelId'])
@Index('idx_activity_model_run', ['modelRunId'])
export class ActivityEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  @AutoMap()
  fileId: string

  @ManyToOne(() => FileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fileId' })
  file: FileEntity

  @Column({ type: 'uuid' })
  @AutoMap()
  userId: string

  @ManyToOne(() => AccountEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user: AccountEntity

  @Column({
    type: 'enum',
    enum: ActivityCategory,
    enumName: 'activity_category_enum',
  })
  @AutoMap()
  category: ActivityCategory

  @Column({
    type: 'enum',
    enum: ActivityOperation,
    enumName: 'activity_operation_enum',
  })
  @AutoMap()
  operation: ActivityOperation

  @Column({
    type: 'enum',
    enum: ActivityStatus,
    enumName: 'activity_status_enum',
  })
  @AutoMap()
  status: ActivityStatus

  @Column({
    type: 'enum',
    enum: AiActivityModelType,
    enumName: 'ai_activity_model_type_enum',
    nullable: true,
  })
  @AutoMap()
  modelType: AiActivityModelType | null

  @Column({ type: 'uuid', nullable: true })
  @AutoMap()
  modelId: string | null

  @Column({ type: 'uuid', nullable: true })
  @AutoMap()
  segmentId: string | null

  @ManyToOne(() => SegmentEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'segmentId' })
  segment: SegmentEntity | null

  @Column({ type: 'timestamptz' })
  @AutoMap()
  startedAt: Date

  @Column({ type: 'timestamptz', nullable: true })
  @AutoMap()
  finishedAt: Date | null

  @Column({ type: 'int', nullable: true })
  @AutoMap()
  durationMs: number | null

  @Column({ type: 'int', nullable: true })
  @AutoMap()
  exitCode: number | null

  @Column({ type: 'text', nullable: true })
  @AutoMap()
  errorMessage: string | null

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null

  @Column({ type: 'uuid', nullable: true })
  @AutoMap()
  modelRunId: string | null

  @ManyToOne(() => ModelRunEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'modelRunId' })
  modelRun: ModelRunEntity | null
}

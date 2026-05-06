import { AutoMap } from '@automapper/classes'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../common/base/entities/base.entity'
import { AccountEntity } from '../account/entities/account.entity'
import { ActivityStatus, AiActivityModelType } from '../activity/enums'
import { ModelRunResultStatus } from './types'

@Entity('model_run')
@Index('idx_model_run_created', ['createdAt'])
@Index('idx_model_run_user', ['userId'])
@Index('idx_model_run_model', ['modelType', 'modelId'])
@Index('uq_model_run_seq', ['modelType', 'modelId', 'runId'], { unique: true })
export class ModelRunEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  @AutoMap()
  userId: string

  @ManyToOne(() => AccountEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user: AccountEntity

  @Column({
    type: 'enum',
    enum: AiActivityModelType,
    enumName: 'ai_activity_model_type_enum',
  })
  @AutoMap()
  modelType: AiActivityModelType

  @Column({ type: 'uuid' })
  @AutoMap()
  modelId: string

  @Column({ type: 'int' })
  @AutoMap()
  runId: number

  @Column({ type: 'int' })
  @AutoMap()
  selectionCount: number

  @Column({
    type: 'enum',
    enum: ActivityStatus,
    enumName: 'activity_status_enum',
  })
  @AutoMap()
  executionStatus: ActivityStatus

  @Column({
    type: 'enum',
    enum: ModelRunResultStatus,
    enumName: 'model_run_result_status_enum',
    nullable: true,
  })
  @AutoMap()
  resultStatus: ModelRunResultStatus | null

  @Column({ type: 'int', nullable: true })
  @AutoMap()
  aggregateConfidence: number | null

  @Column({ type: 'timestamptz' })
  @AutoMap()
  startedAt: Date

  @Column({ type: 'timestamptz', nullable: true })
  @AutoMap()
  finishedAt: Date | null

  @Column({ type: 'int', nullable: true })
  @AutoMap()
  durationMs: number | null

  @Column({ type: 'text', nullable: true })
  @AutoMap()
  errorMessage: string | null
}

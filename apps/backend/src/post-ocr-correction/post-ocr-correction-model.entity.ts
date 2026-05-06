import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { AutoMap } from '@automapper/classes'
import { BaseEntity } from '../common/base/entities/base.entity'
import { AccountEntity } from '../account/entities/account.entity'
import { PostOcrCorrectionModelType } from './types/post-ocr-correction-model-type.enum'

@Entity('post_ocr_correction_models')
export class PostOcrCorrectionModelEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  @Index({ unique: true })
  @AutoMap()
  name: string

  @Column({ type: 'text', nullable: true })
  @AutoMap()
  description: string | null

  @Column({
    type: 'enum',
    enum: PostOcrCorrectionModelType,
    enumName: 'post_ocr_correction_models_type_enum',
  })
  @AutoMap()
  type: PostOcrCorrectionModelType

  @Column({ type: 'varchar', length: 512, nullable: true })
  @AutoMap()
  reference: string | null

  @Column({ type: 'varchar', length: 512, nullable: true })
  @AutoMap()
  configFilePath: string | null

  @Column({ type: 'varchar', length: 512, nullable: true })
  @AutoMap()
  inputMapperFilePath: string | null

  @Column({ type: 'varchar', length: 512, nullable: true })
  @AutoMap()
  outputMapperFilePath: string | null

  @Column({ type: 'uuid', nullable: true })
  @AutoMap(() => String)
  uploadedById: string | null

  @ManyToOne(() => AccountEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploadedById' })
  @AutoMap(() => AccountEntity)
  uploadedBy: AccountEntity | null
}

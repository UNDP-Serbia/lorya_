import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { AutoMap } from '@automapper/classes'
import { BaseEntity } from '../common/base/entities/base.entity'
import { AccountEntity } from '../account/entities/account.entity'
import { OcrModelType } from './types/ocr-model-type.enum'

@Entity('ocr_models')
export class OcrModelEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  @Index({ unique: true })
  @AutoMap()
  name: string

  @Column({ type: 'text', nullable: true })
  @AutoMap()
  description: string | null

  @Column({
    type: 'enum',
    enum: OcrModelType,
    enumName: 'ocr_models_type_enum',
  })
  @AutoMap()
  type: OcrModelType

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

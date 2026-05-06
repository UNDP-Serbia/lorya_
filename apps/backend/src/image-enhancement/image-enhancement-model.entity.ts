import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { AutoMap } from '@automapper/classes'
import { BaseEntity } from '../common/base/entities/base.entity'
import { AccountEntity } from '../account/entities/account.entity'
import { ImageEnhancementModelType } from './types/image-enhancement-model-type.enum'

@Entity('image_enhancement_models')
export class ImageEnhancementModelEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  @Index({ unique: true })
  @AutoMap()
  name: string

  @Column({ type: 'text', nullable: true })
  @AutoMap()
  description: string | null

  @Column({
    type: 'enum',
    enum: ImageEnhancementModelType,
    enumName: 'image_enhancement_models_type_enum',
  })
  @AutoMap()
  type: ImageEnhancementModelType

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

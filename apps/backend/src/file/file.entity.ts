import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm'
import { AutoMap } from '@automapper/classes'
import { BaseEntity } from '../common/base/entities/base.entity'
import { DirectoryEntity } from '../directory/directory.entity'
import { FileStatus } from './types'

@Entity('files')
@Unique(['name', 'directoryId'])
@Index('UQ_files_name_root', ['name'], {
  unique: true,
  where: '"directoryId" IS NULL',
})
export class FileEntity extends BaseEntity {
  @Column()
  @AutoMap()
  name: string

  @Column()
  @AutoMap()
  extension: string

  @Column({ type: 'bigint' })
  @AutoMap()
  size: number

  @Column()
  @AutoMap()
  mimeType: string

  @Column()
  @AutoMap()
  relativePath: string

  @Column({ type: 'uuid', nullable: true })
  @AutoMap()
  directoryId: string | null

  @Column({
    type: 'enum',
    enum: FileStatus,
    default: FileStatus.INITIALIZED,
  })
  @AutoMap()
  status: FileStatus

  @Column({ type: 'boolean', default: false })
  @AutoMap()
  imageModified: boolean

  @Column({ type: 'boolean', default: false })
  @AutoMap()
  humanModified: boolean

  @ManyToOne(() => DirectoryEntity, directory => directory.files, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'directoryId' })
  directory: DirectoryEntity | null
}

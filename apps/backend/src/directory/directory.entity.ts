import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm'
import { AutoMap } from '@automapper/classes'
import { BaseEntity } from '../common/base/entities/base.entity'
import type { FileEntity } from '../file/file.entity'

@Entity('directories')
@Unique(['name', 'parentId'])
@Index('UQ_directories_name_root', ['name'], {
  unique: true,
  where: '"parentId" IS NULL',
})
export class DirectoryEntity extends BaseEntity {
  @Column()
  @AutoMap()
  name: string

  @Column({ type: 'uuid', nullable: true })
  @AutoMap()
  parentId: string | null

  @ManyToOne(() => DirectoryEntity, directory => directory.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent: DirectoryEntity | null

  @OneToMany(() => DirectoryEntity, directory => directory.parent)
  children: DirectoryEntity[]

  @OneToMany('FileEntity', 'directory')
  files: FileEntity[]
}

import { AutoMap } from '@automapper/classes'
import { BaseEntity } from '../../common/base'
import { Column, Entity } from 'typeorm'
import { Role } from '../types'

@Entity('accounts')
export class AccountEntity extends BaseEntity {
  @Column()
  @AutoMap()
  firstName: string

  @Column()
  @AutoMap()
  lastName: string

  @Column()
  @AutoMap()
  email: string

  @Column()
  password: string

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.ADMIN,
  })
  @AutoMap()
  role: Role
}

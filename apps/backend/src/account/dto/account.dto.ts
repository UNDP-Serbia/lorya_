import { AutoMap } from '@automapper/classes'
import { BaseDto } from '../../common/base'
import { ApiProperty } from '@nestjs/swagger'
import { Role } from '../types'

export class AccountDto extends BaseDto {
  @ApiProperty({
    type: String,
    description: 'First name',
    example: 'First',
  })
  @AutoMap()
  firstName: string

  @ApiProperty({
    type: String,
    description: 'Last name',
    example: 'Last',
  })
  @AutoMap()
  lastName: string

  @ApiProperty({
    type: String,
    description: 'Full name',
    example: 'First Last',
  })
  fullName: string

  @ApiProperty({
    type: String,
    description: 'Email',
    example: 'test@lorya.com',
  })
  @AutoMap()
  email: string

  @ApiProperty({
    enum: () => Role,
    description: 'Role',
    example: Role.ADMIN,
  })
  @AutoMap()
  role: Role
}

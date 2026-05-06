import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator'
import { AutoMap } from '@automapper/classes'
import { Role } from '../types'

export class CreateAccountDto {
  @ApiProperty({
    type: String,
    description: 'First name',
    example: 'First',
  })
  @IsNotEmpty({ message: 'First name cannot be empty.' })
  @AutoMap()
  firstName: string

  @ApiProperty({
    type: String,
    description: 'Last name',
    example: 'Last',
  })
  @IsNotEmpty({ message: 'Last name cannot be empty.' })
  @AutoMap()
  lastName: string

  @ApiProperty({
    type: String,
    description: 'Email',
    example: 'test@lorya.com',
  })
  @IsEmail({}, { message: 'Invalid email.' })
  @AutoMap()
  email: string

  @ApiProperty({
    type: String,
    description: 'Password',
    example: 'Test123!',
  })
  @MinLength(8, { message: 'Password must contains minimum 8 characters.' })
  password: string

  @ApiProperty({
    enum: () => Role,
    description: 'Role',
    example: Role.ADMIN,
  })
  @IsEnum(Role, { message: 'Invalid role.' })
  @AutoMap()
  role: Role
}

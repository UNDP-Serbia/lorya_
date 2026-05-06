import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator'
import { AutoMap } from '@automapper/classes'
import { Role } from '../types'

export class UpdateAccountDto {
  @ApiPropertyOptional({
    type: String,
    description: 'First name',
    example: 'First',
  })
  @IsNotEmpty({ message: 'First name cannot be empty.' })
  @IsOptional()
  @AutoMap()
  firstName?: string

  @ApiPropertyOptional({
    type: String,
    description: 'Last name',
    example: 'Last',
  })
  @IsNotEmpty({ message: 'Last name cannot be empty.' })
  @IsOptional()
  @AutoMap()
  lastName?: string

  @ApiPropertyOptional({
    type: String,
    description: 'Email',
    example: 'test@lorya.com',
  })
  @IsEmail({}, { message: 'Invalid email.' })
  @IsOptional()
  @AutoMap()
  email?: string

  @ApiPropertyOptional({
    type: String,
    description: 'Password',
    example: 'Test123!',
  })
  @MinLength(8, { message: 'Password must contains minimum 8 characters.' })
  @IsOptional()
  password?: string

  @ApiPropertyOptional({
    enum: () => Role,
    description: 'Role',
    example: Role.ADMIN,
  })
  @IsEnum(Role, { message: 'Invalid role.' })
  @IsOptional()
  @AutoMap()
  role?: Role
}

import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, MinLength } from 'class-validator'

export class LoginRequestDto {
  @ApiProperty({
    type: String,
    description: 'Email',
    example: 'test@lorya.com',
  })
  @IsEmail({}, { message: 'Invalid email.' })
  email: string

  @ApiProperty({
    type: String,
    description: 'Password',
    example: 'Test123!',
  })
  @MinLength(8, { message: 'Password must contains minimum 8 characters.' })
  password: string
}

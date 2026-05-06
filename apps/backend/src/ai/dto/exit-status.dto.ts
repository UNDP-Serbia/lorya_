import { ApiProperty } from '@nestjs/swagger'

export class ExitStatusDto {
  @ApiProperty({
    description: 'Success',
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: 'Message',
    example: 'Successfully completed pdf splitting.',
  })
  message: string

  constructor(success: boolean, message: string) {
    this.success = success
    this.message = message
  }
}

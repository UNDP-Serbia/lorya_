import { ApiProperty } from '@nestjs/swagger'

export class RotateResultDto {
  @ApiProperty({
    description: 'Whether the rotation succeeded',
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: 'Status message',
    example: 'Image successfully rotated.',
  })
  message: string

  @ApiProperty({
    description: 'Path to the rotated image',
    example: '/path/to/output/image-rotated.jpg',
  })
  outputPath: string
}

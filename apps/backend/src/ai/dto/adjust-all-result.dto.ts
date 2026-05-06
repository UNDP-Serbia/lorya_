import { ApiProperty } from '@nestjs/swagger'

export class AdjustAllResultDto {
  @ApiProperty({
    description: 'Whether the adjustment succeeded',
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: 'Status message',
    example: 'Image successfully adjusted.',
  })
  message: string

  @ApiProperty({
    description: 'Path to the adjusted image',
    example: '/path/to/output/image.jpg',
  })
  outputPath: string
}

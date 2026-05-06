import { ApiProperty } from '@nestjs/swagger'

export class AdjustContrastResultDto {
  @ApiProperty({
    description: 'Whether the contrast adjustment succeeded',
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: 'Status message',
    example: 'Image constrast changed successfully.',
  })
  message: string

  @ApiProperty({
    description: 'Path to the adjusted image',
    example: '/path/to/output/image.jpg',
  })
  outputPath: string
}

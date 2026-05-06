import { ApiProperty } from '@nestjs/swagger'

export class AdjustBrightnessResultDto {
  @ApiProperty({
    description: 'Whether the brightness adjustment succeeded',
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: 'Status message',
    example: 'Image brightness changed successfully.',
  })
  message: string

  @ApiProperty({
    description: 'Path to the adjusted image',
    example: '/path/to/output/image.jpg',
  })
  outputPath: string
}

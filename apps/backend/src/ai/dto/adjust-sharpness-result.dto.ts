import { ApiProperty } from '@nestjs/swagger'

export class AdjustSharpnessResultDto {
  @ApiProperty({
    description: 'Whether the sharpness adjustment succeeded',
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: 'Status message',
    example: 'Image sharpness changed successfully.',
  })
  message: string

  @ApiProperty({
    description: 'Path to the adjusted image',
    example: '/path/to/output/image.jpg',
  })
  outputPath: string
}

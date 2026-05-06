import { ApiProperty } from '@nestjs/swagger'

export class ModelProcessingResultDto {
  @ApiProperty({
    description: 'Whether the model processing succeeded',
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: 'Status message',
    example: 'Image successfully processed.',
  })
  message: string

  @ApiProperty({
    description: 'Path to the processed image',
    example: '/path/to/output/image.jpg',
  })
  outputPath: string
}

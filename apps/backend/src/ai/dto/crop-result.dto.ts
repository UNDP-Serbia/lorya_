import { ApiProperty } from '@nestjs/swagger'

export class CropResultDto {
  @ApiProperty({
    description: 'Whether the crop succeeded',
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: 'Status message',
    example: 'Image successfully cropped.',
  })
  message: string

  @ApiProperty({
    description: 'Path to the cropped image',
    example: '/path/to/output/image.jpg',
  })
  outputPath: string
}

import { ApiProperty } from '@nestjs/swagger'

export class AdjustSegmentResultDto {
  @ApiProperty({
    description: 'Whether the adjustment succeeded',
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: 'Status message',
    example: 'Segment adjusted successfully.',
  })
  message: string

  @ApiProperty({
    description: 'Output path of the adjusted segment image',
    example: 'segments/file-id/modified/cropped_image_image_uuid.jpg',
  })
  outputPath: string
}

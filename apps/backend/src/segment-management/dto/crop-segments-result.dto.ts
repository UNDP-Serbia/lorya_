import { ApiProperty } from '@nestjs/swagger'
import { LabelType } from 'src/layout-identification/dto'
import { BoundingBoxDto } from './crop-segments.dto'

export class SegmentResponseDto {
  @ApiProperty({
    description: 'Segment UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string

  @ApiProperty({
    description: 'Segment label (e.g. Text, Picture, Table)',
    example: 'Text',
  })
  label: string

  @ApiProperty({
    description: 'Label type classification',
    enum: LabelType,
    example: LabelType.TEXT,
  })
  labelType: LabelType

  @ApiProperty({
    description: 'Bounding box coordinates',
    type: BoundingBoxDto,
  })
  boundingBox: BoundingBoxDto

  @ApiProperty({
    description: 'Confidence score (0-1)',
    example: 0.95,
  })
  confidence: number

  @ApiProperty({
    description: 'Relative path to the original cropped segment image',
    example: 'segments/file-id/original/cropped_image_image_uuid.jpg',
  })
  originalPath: string

  @ApiProperty({
    description: 'Relative path to the modified segment image',
    example: 'segments/file-id/modified/cropped_image_image_uuid.jpg',
  })
  modifiedPath: string

  @ApiProperty({
    description: 'Whether the segment image has been modified',
    example: false,
  })
  changed: boolean

  @ApiProperty({
    description: 'File UUID this segment belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  fileId: string

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date
}

export class CropSegmentsResultDto {
  @ApiProperty({
    description: 'Whether the cropping succeeded',
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: 'Status message',
    example: 'Segments cropped successfully.',
  })
  message: string

  @ApiProperty({
    description: 'File UUID that was segmented',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  fileId: string
}

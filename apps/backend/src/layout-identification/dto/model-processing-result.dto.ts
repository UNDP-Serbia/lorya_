import { ApiProperty } from '@nestjs/swagger'

export enum LabelType {
  TEXT = 'text',
  NON_TEXT = 'non-text',
}

export class BoundingBoxDto {
  @ApiProperty({ description: 'Left x coordinate', example: 146.09 })
  x1: number

  @ApiProperty({ description: 'Top y coordinate', example: 399.39 })
  y1: number

  @ApiProperty({ description: 'Right x coordinate', example: 1077.96 })
  x2: number

  @ApiProperty({ description: 'Bottom y coordinate', example: 1328.23 })
  y2: number
}

export class SegmentDto {
  @ApiProperty({ description: 'Segment identifier', example: '1' })
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

  @ApiProperty({ description: 'Confidence score', example: 0.972 })
  confidence: number

  @ApiProperty({
    description: 'Bounding box coordinates',
    type: BoundingBoxDto,
  })
  boundingBox: BoundingBoxDto
}

export class ModelProcessingResultDto {
  @ApiProperty({
    description: 'Whether the model processing succeeded',
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: 'Status message',
    example: 'Image is successfully segmented.',
  })
  message: string

  @ApiProperty({
    description: 'Detected layout segments',
    type: [SegmentDto],
  })
  segments: SegmentDto[]
}

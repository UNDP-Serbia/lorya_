import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNumber, IsUUID, Max, Min } from 'class-validator'

export class AdjustSegmentDto {
  @IsUUID()
  @ApiProperty({
    type: String,
    description: 'Segment UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  segmentId: string

  @ApiProperty({
    type: Number,
    description:
      'Brightness factor (1.0 = original, >1 = brighter, <1 = darker)',
    example: 1.0,
    minimum: 0.01,
    maximum: 2,
  })
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? Number(value) : undefined
  )
  @IsNumber()
  @Min(0.01, { message: 'brightness must be greater than 0' })
  @Max(2, { message: 'brightness must be less than or equal to 2' })
  brightness: number

  @ApiProperty({
    type: Number,
    description:
      'Contrast factor (1.0 = original, >1 = higher contrast, <1 = lower contrast)',
    example: 1.0,
    minimum: 0.01,
    maximum: 2,
  })
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? Number(value) : undefined
  )
  @IsNumber()
  @Min(0.01, { message: 'contrast must be greater than 0' })
  @Max(2, { message: 'contrast must be less than or equal to 2' })
  contrast: number

  @ApiProperty({
    type: Number,
    description:
      'Sharpness factor (1.0 = original, >1 = sharper, <1 = more blurry)',
    example: 1.0,
    minimum: 0.01,
    maximum: 2,
  })
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? Number(value) : undefined
  )
  @IsNumber()
  @Min(0.01, { message: 'sharpness must be greater than 0' })
  @Max(2, { message: 'sharpness must be less than or equal to 2' })
  sharpness: number
}

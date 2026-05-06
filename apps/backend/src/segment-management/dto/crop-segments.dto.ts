import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { IsPath, TransformPath } from 'src/common/decorators'
import { DirectoryEntryType } from 'src/file-manager/types/directory-entry-type.enum'
import { LabelType } from 'src/layout-identification/dto'
import { SegmentType } from 'src/segment-management/segment.entity'

export class BoundingBoxDto {
  @IsNumber()
  @ApiProperty({ description: 'Left x coordinate', example: 146.09 })
  x1: number

  @IsNumber()
  @ApiProperty({ description: 'Top y coordinate', example: 399.39 })
  y1: number

  @IsNumber()
  @ApiProperty({ description: 'Right x coordinate', example: 1077.96 })
  x2: number

  @IsNumber()
  @ApiProperty({ description: 'Bottom y coordinate', example: 1328.23 })
  y2: number
}

export class CropSegmentInputDto {
  @IsString()
  @ApiProperty({
    description: 'Segment label (e.g. Text, Picture, Table)',
    example: 'Text',
  })
  label: string

  @IsEnum(LabelType)
  @ApiProperty({
    description: 'Label type classification',
    enum: LabelType,
    example: LabelType.TEXT,
  })
  labelType: LabelType

  @ValidateNested()
  @Type(() => BoundingBoxDto)
  @ApiProperty({
    description: 'Bounding box coordinates',
    type: BoundingBoxDto,
  })
  boundingBox: BoundingBoxDto

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  @ApiProperty({
    description: 'Confidence score (0-1), defaults to 1 for manual segments',
    example: 0.95,
    required: false,
  })
  confidence?: number

  @IsEnum(SegmentType)
  @IsOptional()
  @ApiProperty({
    description:
      'Segment type — MANUAL if drawn by user, GENERATED if auto-detected',
    enum: SegmentType,
    example: SegmentType.GENERATED,
    required: false,
  })
  type?: SegmentType

  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description:
      'ModelRun id ako je segment generated od strane modela; null/undefined za MANUAL.',
    type: String,
    format: 'uuid',
    required: false,
    nullable: true,
  })
  modelRunId?: string | null
}

export class CropSegmentsDto {
  @IsPath({ type: DirectoryEntryType.DIRECTORY })
  @TransformPath()
  @ApiProperty({
    type: String,
    description: 'Directory containing the image file to process',
    example: '/path/to/images',
  })
  inputDir: string

  @IsString()
  @ApiProperty({
    type: String,
    description: 'Image file name including extension',
    example: 'image.jpg',
  })
  fileName: string

  @IsArray()
  @ArrayMinSize(1, { message: 'Segments cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => CropSegmentInputDto)
  @ApiProperty({
    description: 'Segments to crop from the image',
    type: [CropSegmentInputDto],
  })
  segments: CropSegmentInputDto[]
}

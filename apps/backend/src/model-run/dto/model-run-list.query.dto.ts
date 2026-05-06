import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator'
import { AiActivityModelType } from '../../activity/enums'
import { ModelRunResultStatus } from '../types'

export class ModelRunListQueryDto {
  @ApiPropertyOptional({ type: Number, default: 1, minimum: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({
    type: Number,
    default: 50,
    minimum: 1,
    maximum: 200,
    example: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50

  @ApiPropertyOptional({
    enum: AiActivityModelType,
    example: AiActivityModelType.OCR,
  })
  @IsOptional()
  @IsEnum(AiActivityModelType)
  modelType?: AiActivityModelType

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    example: '8b4d1f4a-2e3a-4f5b-9c6d-1a2b3c4d5e6f',
  })
  @IsOptional()
  @IsUUID()
  modelId?: string

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    example: '11111111-2222-3333-4444-555555555555',
  })
  @IsOptional()
  @IsUUID()
  userId?: string

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    example: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  })
  @IsOptional()
  @IsUUID()
  directoryId?: string

  @ApiPropertyOptional({
    enum: ModelRunResultStatus,
    example: ModelRunResultStatus.PARTIAL,
  })
  @IsOptional()
  @IsEnum(ModelRunResultStatus)
  resultStatus?: ModelRunResultStatus

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2026-04-01T00:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  from?: string

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2026-04-30T23:59:59Z',
  })
  @IsOptional()
  @IsISO8601()
  to?: string
}

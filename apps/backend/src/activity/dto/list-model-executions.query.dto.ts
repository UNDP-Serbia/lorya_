import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsISO8601, IsOptional, IsUUID } from 'class-validator'
import { ActivityStatus, AiActivityModelType } from '../enums'

export class ListModelExecutionsQueryDto {
  @ApiPropertyOptional({ enum: AiActivityModelType })
  @IsOptional()
  @IsEnum(AiActivityModelType)
  modelType?: AiActivityModelType

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  modelId?: string

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  fileId?: string

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  directoryId?: string

  @ApiPropertyOptional({ enum: ActivityStatus })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsISO8601()
  from?: string

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsISO8601()
  to?: string
}

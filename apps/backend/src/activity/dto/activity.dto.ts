import { ApiProperty } from '@nestjs/swagger'
import { AutoMap } from '@automapper/classes'
import {
  ActivityCategory,
  ActivityOperation,
  ActivityStatus,
  AiActivityModelType,
} from '../enums'

export class ActivityDto {
  @ApiProperty({ type: String })
  @AutoMap()
  id: string

  @ApiProperty({ type: String })
  @AutoMap()
  fileId: string

  @ApiProperty({ type: String })
  @AutoMap()
  userId: string

  @ApiProperty({ type: String })
  userFullName: string

  @ApiProperty({ enum: ActivityCategory })
  @AutoMap()
  category: ActivityCategory

  @ApiProperty({ enum: ActivityOperation })
  @AutoMap()
  operation: ActivityOperation

  @ApiProperty({ enum: ActivityStatus })
  @AutoMap()
  status: ActivityStatus

  @ApiProperty({ enum: AiActivityModelType, nullable: true })
  @AutoMap()
  modelType: AiActivityModelType | null

  @ApiProperty({ type: String, nullable: true })
  @AutoMap()
  modelId: string | null

  @ApiProperty({ type: String, nullable: true })
  modelName: string | null

  @ApiProperty({ type: String, nullable: true })
  @AutoMap()
  segmentId: string | null

  @ApiProperty({ type: String })
  startedAt: string

  @ApiProperty({ type: String, nullable: true })
  finishedAt: string | null

  @ApiProperty({ type: Number, nullable: true })
  @AutoMap()
  durationMs: number | null

  @ApiProperty({ type: String, nullable: true })
  @AutoMap()
  errorMessage: string | null
}

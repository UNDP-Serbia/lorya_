import { ApiProperty } from '@nestjs/swagger'
import { AutoMap } from '@automapper/classes'
import { ActivityStatus } from '../../activity/enums'
import { ModelRunResultStatus } from '../types'

export class ModelRunCompletedDto {
  @AutoMap()
  @ApiProperty({
    type: String,
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef0123456789',
  })
  id: string

  @AutoMap()
  @ApiProperty({ enum: ActivityStatus, example: ActivityStatus.SUCCESS })
  executionStatus: ActivityStatus

  @AutoMap()
  @ApiProperty({
    enum: ModelRunResultStatus,
    example: ModelRunResultStatus.PARTIAL,
    nullable: true,
  })
  resultStatus: ModelRunResultStatus | null

  @AutoMap()
  @ApiProperty({ type: Number, nullable: true, example: 87 })
  aggregateConfidence: number | null

  @AutoMap()
  @ApiProperty({ type: Number, example: 1063000 })
  durationMs: number
}

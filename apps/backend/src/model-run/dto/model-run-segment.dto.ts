import { ApiProperty } from '@nestjs/swagger'
import { AutoMap } from '@automapper/classes'

export type RunHistoryStatus = 'success' | 'failed' | 'pending' | 'warning'

export class ModelRunSegmentDto {
  @AutoMap()
  @ApiProperty({
    type: String,
    format: 'uuid',
    example: '6b1f8b73-2e23-4cae-9b59-2c5fa0d6b8a1',
  })
  id: string

  @AutoMap()
  @ApiProperty({
    type: Number,
    description: 'Segment order number within the file',
    example: 3,
  })
  segmentId: number

  @AutoMap()
  @ApiProperty({ type: String, example: 'Text (Body)' })
  segmentLabel: string

  @AutoMap()
  @ApiProperty({
    type: String,
    enum: ['success', 'failed', 'pending', 'warning'],
    example: 'success',
  })
  status: RunHistoryStatus

  @AutoMap()
  @ApiProperty({ type: Number, nullable: true, example: 91 })
  confidence: number | null

  @AutoMap()
  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
    description: 'Always null in v1',
  })
  reportUrl: string | null
}

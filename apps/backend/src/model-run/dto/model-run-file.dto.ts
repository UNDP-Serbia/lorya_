import { ApiProperty } from '@nestjs/swagger'
import { AutoMap } from '@automapper/classes'
import type { RunHistoryStatus } from './model-run-segment.dto'

export class ModelRunFileDto {
  @AutoMap()
  @ApiProperty({
    type: String,
    format: 'uuid',
    example: 'd17b9e5c-1e44-4f6a-9c63-3b1c8c6e8e4d',
  })
  id: string

  @AutoMap()
  @ApiProperty({
    type: String,
    format: 'uuid',
    example: 'f17b9e5c-1e44-4f6a-9c63-3b1c8c6e8e4d',
  })
  fileId: string

  @AutoMap()
  @ApiProperty({ type: String, example: 'Zena_i_svet_1925_3_4.jpeg' })
  fileName: string

  @AutoMap()
  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
    description: 'Always null in v1',
  })
  imageLabel: string | null

  @AutoMap()
  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
    description: 'Always null in v1',
  })
  fileUrl: string | null

  @AutoMap()
  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
    description: 'Always null in v1',
  })
  reportUrl: string | null

  @AutoMap()
  @ApiProperty({
    type: String,
    enum: ['success', 'failed', 'pending', 'warning'],
    example: 'success',
  })
  status: RunHistoryStatus

  @AutoMap()
  @ApiProperty({ type: Number, nullable: true, example: 87 })
  confidence: number | null

  @AutoMap()
  @ApiProperty({
    type: Boolean,
    description: 'True for OCR/Post-OCR runs with at least one segment',
    example: true,
  })
  hasSegments: boolean
}

import { ApiProperty } from '@nestjs/swagger'
import { AutoMap } from '@automapper/classes'
import { AiActivityModelType } from '../../activity/enums'
import { ModelRunFileDto } from './model-run-file.dto'
import type { RunHistoryStatus } from './model-run-segment.dto'

export class ModelRunListItemDto {
  @AutoMap()
  @ApiProperty({
    type: String,
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef0123456789',
  })
  id: string

  @AutoMap()
  @ApiProperty({ type: Number, example: 12 })
  runId: number

  @AutoMap()
  @ApiProperty({ type: Number, example: 8 })
  selectionCount: number

  @AutoMap()
  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
    description: 'Always null in v1',
  })
  selectionLabel: string | null

  @AutoMap()
  @ApiProperty({ enum: AiActivityModelType, example: AiActivityModelType.OCR })
  modelType: AiActivityModelType

  @AutoMap()
  @ApiProperty({
    type: String,
    format: 'uuid',
    example: '8b4d1f4a-2e3a-4f5b-9c6d-1a2b3c4d5e6f',
  })
  modelId: string

  @AutoMap()
  @ApiProperty({ type: String, example: 'Tesseract SRP' })
  modelName: string

  @AutoMap()
  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
    description: 'Always null in v1',
  })
  modelExecutionId: string | null

  @AutoMap()
  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
    description: 'Always null in v1',
  })
  modelUrl: string | null

  @AutoMap()
  @ApiProperty({
    type: String,
    enum: ['success', 'failed', 'pending', 'warning'],
    example: 'warning',
  })
  status: RunHistoryStatus

  @AutoMap()
  @ApiProperty({ type: Number, nullable: true, example: 87 })
  confidence: number | null

  @AutoMap()
  @ApiProperty({ type: String, example: 'Ivan Djordjevic' })
  runBy: string

  @AutoMap()
  @ApiProperty({ type: String, example: '2026-04-29T14:27:18.000Z' })
  startedAt: string

  @AutoMap()
  @ApiProperty({ type: Number, nullable: true, example: 1063000 })
  durationMs: number | null

  @AutoMap(() => [ModelRunFileDto])
  @ApiProperty({ type: () => [ModelRunFileDto] })
  files: ModelRunFileDto[]
}

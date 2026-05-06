import { ApiProperty } from '@nestjs/swagger'
import { ModelRunListItemDto } from './model-run-list-item.dto'

export class ModelRunListResponseDto {
  @ApiProperty({ type: String, example: '2026-04-29T14:27:18.000Z' })
  generatedAt: string

  @ApiProperty({ type: Number, example: 142 })
  total: number

  @ApiProperty({ type: Number, example: 1 })
  page: number

  @ApiProperty({ type: Number, example: 50 })
  limit: number

  @ApiProperty({ type: () => [ModelRunListItemDto] })
  items: ModelRunListItemDto[]
}

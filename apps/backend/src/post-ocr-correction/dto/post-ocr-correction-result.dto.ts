import { ApiProperty } from '@nestjs/swagger'
import { OcrLineDto, OcrStatisticsDto } from '../../ocr/dto'

export class PostOcrCorrectionStatisticsDto extends OcrStatisticsDto {
  @ApiProperty({
    description: 'Character Error Rate',
    example: 20.2,
    nullable: true,
  })
  cer: number | null

  @ApiProperty({
    description: 'Word Error Rate',
    example: 10.4,
    nullable: true,
  })
  wer: number | null
}

export class PostOcrCorrectionSegmentDataDto {
  @ApiProperty({ description: 'Segment identifier' })
  segmentId: string

  @ApiProperty({ description: 'Segment file name' })
  segmentFile: string

  @ApiProperty({ description: 'Detected language' })
  lang: string

  @ApiProperty({ description: 'Detected script' })
  script: string

  @ApiProperty({ type: [OcrLineDto], description: 'Corrected text lines' })
  lines: OcrLineDto[]

  @ApiProperty({
    type: PostOcrCorrectionStatisticsDto,
    description: 'Post-OCR correction statistics',
  })
  statistics: PostOcrCorrectionStatisticsDto
}

export class PostOcrCorrectionProcessingResultDto {
  @ApiProperty({ description: 'Whether processing was successful' })
  success: boolean

  @ApiProperty({ description: 'Result message' })
  message: string

  @ApiProperty({
    type: [PostOcrCorrectionSegmentDataDto],
    description: 'Per-segment post-OCR correction data',
  })
  data: PostOcrCorrectionSegmentDataDto[]
}

export class PostOcrCorrectionResultsResponseDto {
  @ApiProperty({ description: 'Whether the query was successful' })
  success: boolean

  @ApiProperty({
    enum: ['BUILTIN', 'HUGGINGFACE', 'LITELLM'],
    nullable: true,
    description: 'Kind of model that produced these results, when known',
  })
  modelKind: string | null

  @ApiProperty({
    type: [PostOcrCorrectionSegmentDataDto],
    description: 'Saved post-OCR correction results per segment',
  })
  data: PostOcrCorrectionSegmentDataDto[]
}

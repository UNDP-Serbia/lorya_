import { ApiProperty } from '@nestjs/swagger'

export class OcrWordDto {
  @ApiProperty({ description: 'Unique word identifier', example: '1' })
  word_id: number

  @ApiProperty({
    description: 'Word confidence score',
    example: 96.604668,
    nullable: true,
  })
  word_confidence: number | null

  @ApiProperty({ description: 'Recognized word text', example: 'На' })
  word_text: string

  @ApiProperty({
    description: 'User-edited word text (null if not edited)',
    example: 'На',
    required: false,
  })
  edited_word_text?: string
}

export class OcrLineDto {
  @ApiProperty({ description: 'Unique line identifier', example: '1' })
  line_id: number

  @ApiProperty({
    type: [OcrWordDto],
    description: 'Words in this line',
    example: [
      { word_id: '1', word_confidence: 96.604668, word_text: 'На' },
      { word_id: '2', word_confidence: 96.883347, word_text: 'последњој' },
      { word_id: '3', word_confidence: 93.81765, word_text: 'слици' },
    ],
  })
  words: OcrWordDto[]
}

export class OcrStatisticsDto {
  @ApiProperty({
    description: 'Average word confidence score',
    example: 92.788392,
    nullable: true,
  })
  avg_word_confidence: number | null
}

export class OcrDataDto {
  @ApiProperty({ description: 'Detected language', example: 'srp' })
  lang: string

  @ApiProperty({ description: 'Detected script', example: 'cyrillic' })
  script: string

  @ApiProperty({ type: [OcrLineDto], description: 'Recognized text lines' })
  lines: OcrLineDto[]

  @ApiProperty({
    type: OcrStatisticsDto,
    description: 'OCR processing statistics',
  })
  statistics: OcrStatisticsDto
}

export class OcrSegmentDataDto {
  @ApiProperty({ description: 'Segment identifier', example: '1' })
  segmentId: string

  @ApiProperty({
    description: 'Segment file name',
    example: 'cropped_1_image_27.jpg',
  })
  segmentFile: string

  @ApiProperty({ description: 'Detected language', example: 'srp' })
  lang: string

  @ApiProperty({ description: 'Detected script', example: 'cyrillic' })
  script: string

  @ApiProperty({ type: [OcrLineDto], description: 'Recognized text lines' })
  lines: OcrLineDto[]

  @ApiProperty({
    type: OcrStatisticsDto,
    description: 'OCR processing statistics',
  })
  statistics: OcrStatisticsDto
}

export class OcrProcessingResultDto {
  @ApiProperty({
    description: 'Whether processing was successful',
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: 'Result message',
    example: 'OCR processing completed.',
  })
  message: string

  @ApiProperty({
    type: [OcrSegmentDataDto],
    description: 'Per-segment OCR processing data',
  })
  data: OcrSegmentDataDto[]
}

export class OcrResultsResponseDto {
  @ApiProperty({
    description: 'Whether the query was successful',
    example: true,
  })
  success: boolean

  @ApiProperty({
    enum: ['BUILTIN', 'HUGGINGFACE', 'LITELLM'],
    nullable: true,
    description: 'Kind of model that produced these results, when known',
  })
  modelKind: string | null

  @ApiProperty({
    type: [OcrSegmentDataDto],
    description: 'Saved OCR results per segment',
  })
  data: OcrSegmentDataDto[]
}

export type OcrProcessRequestDto = {
  inputDir: string
  fileName: string
  modelRunId?: string
  prompt?: string
}

export type OcrWord = {
  word_id: number
  word_confidence: number
  word_text: string
  edited_word_text?: string
}

export type OcrLine = {
  line_id: number
  words: OcrWord[]
}

export type OcrStatistics = {
  avg_word_confidence: number
}

export type OcrData = {
  lang: string
  script: string
  lines: OcrLine[]
  statistics: OcrStatistics
}

export type OcrSegmentData = {
  segmentId: string
  segmentFile: string
  lang: string
  script: string
  lines: OcrLine[]
  statistics: OcrStatistics
  // labelType: 'text' | 'non-text'  - TODO this should be added to the BE
  // label: string  - TODO this should be added to the BE
}

export type OcrProcessingResultDto = {
  success: boolean
  message: string
  data: OcrSegmentData[]
}

export type OcrResultsResponseDto = {
  success: boolean
  modelKind?: 'BUILTIN' | 'HUGGINGFACE' | 'LITELLM' | null
  data: OcrSegmentData[]
}

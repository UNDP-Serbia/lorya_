import type { OcrLine, OcrStatistics } from './ocr.types'

export type PostOcrCorrectionStatistics = OcrStatistics & {
  cer: number
  wer: number
}

export type PostOcrCorrectionSegmentData = {
  segmentId: string
  segmentFile: string
  lang: string
  script: string
  lines: OcrLine[]
  statistics: PostOcrCorrectionStatistics
}

export type PostOcrCorrectionProcessingResultDto = {
  success: boolean
  message: string
  data: PostOcrCorrectionSegmentData[]
}

export type PostOcrCorrectionResultsResponseDto = {
  success: boolean
  data: PostOcrCorrectionSegmentData[]
}

export type SaveWordEditRequestDto = {
  segmentId: string
  lineId: number
  wordIndex: number
  newText: string
}

import { OcrLineDto } from '../ocr/dto'

export interface LlmRunInput {
  task: 'ocr' | 'post_ocr'
  configPath: string
  prompt?: string
  parameters?: Record<string, unknown>
  image?: string // base64 — for OCR
  ocr?: { lines: unknown[] } // for Post-OCR
}

export interface LlmStatistics {
  avg_word_confidence: number | null
  cer?: number | null
  wer?: number | null
}

export interface ParsedLlmResult {
  status: { success: boolean; messageText?: string }
  lang?: string
  script?: string
  lines?: OcrLineDto[]
  statistics?: LlmStatistics
}

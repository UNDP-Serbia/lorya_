import type { OcrSegmentData } from './ocr.types'

export type EditedWord = {
  wordId: number
  originalText: string
  editedText: string
  isEdited: boolean
  confidence: number
}

export type OcrEditorLine = {
  lineId: number
  words: EditedWord[]
}

export type OcrEditorSegment = {
  segmentId: string
  segmentFile: string
  lang: string
  script: string
  lines: OcrEditorLine[]
  statistics: {
    avg_word_confidence: number
    min_word_confidence: number
    max_word_confidence: number
  }
}

export const toEditorSegments = (raw: OcrSegmentData[]): OcrEditorSegment[] =>
  raw.map(seg => {
    const allConfidences = seg.lines.flatMap(l =>
      l.words.map(w => w.word_confidence)
    )
    return {
      segmentId: seg.segmentId,
      segmentFile: seg.segmentFile,
      lang: seg.lang,
      script: seg.script,
      statistics: {
        avg_word_confidence: seg.statistics.avg_word_confidence,
        min_word_confidence: allConfidences.length
          ? Math.min(...allConfidences)
          : 0,
        max_word_confidence: allConfidences.length
          ? Math.max(...allConfidences)
          : 0,
      },
      lines: seg.lines.map(line => ({
        lineId: line.line_id,
        words: line.words.map(w => ({
          wordId: w.word_id,
          originalText: w.word_text,
          editedText: w.edited_word_text ?? w.word_text,
          isEdited: !!w.edited_word_text,
          confidence: w.word_confidence,
        })),
      })),
    }
  })

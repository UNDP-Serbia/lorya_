export const DEFAULT_OCR_OUTPUT_FORMAT_PROMPT = `Return a single JSON object with these fields:
- lang: detected language code (e.g. "srp", "eng")
- script: script name (e.g. "cyrillic", "latin")
- lines: array of { line_id, words: [{ word_id, word_text }] }

Use numeric line_id and word_id starting from 1. Do not wrap the JSON in markdown.`

export const DEFAULT_POST_OCR_OUTPUT_FORMAT_PROMPT = `Return a single JSON object with the same structure as the input OCR JSON:
- lang, script, lines (array of { line_id, words: [{ word_id, word_text }] })

Preserve line_id and word_id from the input where possible. Return only the corrected text in word_text. Do not wrap the JSON in markdown.`

export type LlmTask = 'ocr' | 'post_ocr'

export function getDefaultOutputFormatPrompt(task: LlmTask): string {
  return task === 'post_ocr'
    ? DEFAULT_POST_OCR_OUTPUT_FORMAT_PROMPT
    : DEFAULT_OCR_OUTPUT_FORMAT_PROMPT
}

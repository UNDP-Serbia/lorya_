export type ModelCategory =
  | 'image-enhancement'
  | 'layout-identification'
  | 'ocr'
  | 'post-ocr-correction'

export function labelToCategory(label: string): ModelCategory | null {
  switch (label) {
    case 'Image Enhancement':
      return 'image-enhancement'
    case 'Layout Identification':
      return 'layout-identification'
    case 'Optical Character Recognition':
      return 'ocr'
    case 'Post-OCR Correction':
      return 'post-ocr-correction'
    default:
      return null
  }
}

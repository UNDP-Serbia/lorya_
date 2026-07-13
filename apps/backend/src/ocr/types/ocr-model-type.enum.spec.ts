import { OcrModelType } from './ocr-model-type.enum'
import { PostOcrCorrectionModelType } from '../../post-ocr-correction/types/post-ocr-correction-model-type.enum'

describe('model type enums', () => {
  it('OCR enum exposes LITELLM', () => {
    expect(OcrModelType.LITELLM).toBe('LITELLM')
  })
  it('Post-OCR enum exposes LITELLM', () => {
    expect(PostOcrCorrectionModelType.LITELLM).toBe('LITELLM')
  })
})

import {
  imageEnhancementModelsEndpoints,
  layoutIdentificationModelsEndpoints,
  ocrModelsEndpoints,
  postOcrCorrectionModelsEndpoints,
} from '../../api/interface/ai-models'
import type { ModelCategory } from '../../utils/model-category'

export function endpointsFor(category: ModelCategory) {
  switch (category) {
    case 'image-enhancement':
      return imageEnhancementModelsEndpoints
    case 'layout-identification':
      return layoutIdentificationModelsEndpoints
    case 'ocr':
      return ocrModelsEndpoints
    case 'post-ocr-correction':
      return postOcrCorrectionModelsEndpoints
  }
}

export const modelsQueryKey = (category: ModelCategory) =>
  ['models', category, 'list'] as const

export const modelQueryKey = (category: ModelCategory, id: string) =>
  ['models', category, 'detail', id] as const

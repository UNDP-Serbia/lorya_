import { AiModelDto } from 'src/ai-model/dto'

export const SEGMENT_MANAGEMENT_MODELS: AiModelDto[] = [
  { id: 'binarization', name: 'Binarization', path: null },
  {
    id: 'adaptive-thresholding',
    name: 'Adaptive Thresholding',
    path: '/app/image_enhancement/adaptive_thresholding.py',
  },
  { id: 'otsu-thresholding', name: 'Otsu Thresholding', path: null },
  { id: 'sauvola-thresholding', name: 'Sauvola Thresholding', path: null },
  { id: 'restormer', name: 'Restormer', path: null },
]

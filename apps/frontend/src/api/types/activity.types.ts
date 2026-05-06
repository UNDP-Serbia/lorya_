export enum ActivityCategory {
  MODEL_RUN = 'MODEL_RUN',
  MANUAL_OPERATION = 'MANUAL_OPERATION',
}

export enum ActivityStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export enum AiActivityModelType {
  LAYOUT_IDENTIFICATION = 'LAYOUT_IDENTIFICATION',
  IMAGE_ENHANCEMENT = 'IMAGE_ENHANCEMENT',
  OCR = 'OCR',
  POST_OCR_CORRECTION = 'POST_OCR_CORRECTION',
}

export enum ActivityOperation {
  LAYOUT_IDENTIFICATION = 'LAYOUT_IDENTIFICATION',
  IMAGE_ENHANCEMENT = 'IMAGE_ENHANCEMENT',
  OCR = 'OCR',
  POST_OCR_CORRECTION = 'POST_OCR_CORRECTION',
  ROTATE = 'ROTATE',
  CROP = 'CROP',
  BRIGHTNESS_ADJUST = 'BRIGHTNESS_ADJUST',
  CONTRAST_ADJUST = 'CONTRAST_ADJUST',
  SHARPNESS_ADJUST = 'SHARPNESS_ADJUST',
  PDF_SPLIT = 'PDF_SPLIT',
  SEGMENT_ADD = 'SEGMENT_ADD',
  SEGMENT_RESHAPE = 'SEGMENT_RESHAPE',
  SEGMENT_DELETE = 'SEGMENT_DELETE',
  SEGMENT_LABEL_CHANGE = 'SEGMENT_LABEL_CHANGE',
  SEGMENT_REORDER = 'SEGMENT_REORDER',
  SEGMENT_REVERT = 'SEGMENT_REVERT',
  SEGMENTS_CROP = 'SEGMENTS_CROP',
  OCR_TEXT_EDIT = 'OCR_TEXT_EDIT',
  POST_OCR_TEXT_EDIT = 'POST_OCR_TEXT_EDIT',
  LAYOUT_IDENTIFICATION_REVERT = 'LAYOUT_IDENTIFICATION_REVERT',
  IMAGE_ENHANCEMENT_REVERT = 'IMAGE_ENHANCEMENT_REVERT',
  OCR_REVERT = 'OCR_REVERT',
  POST_OCR_REVERT = 'POST_OCR_REVERT',
  FILE_RESET = 'FILE_RESET',
}

export type ActivityDto = {
  id: string
  fileId: string
  userId: string
  userFullName: string
  category: ActivityCategory
  operation: ActivityOperation
  status: ActivityStatus
  modelType: AiActivityModelType | null
  modelId: string | null
  modelName: string | null
  segmentId: string | null
  startedAt: string
  finishedAt: string | null
  durationMs: number | null
  errorMessage: string | null
}

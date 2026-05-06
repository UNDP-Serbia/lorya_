import type { BoundingBox, LabelType } from './layout-identification.types'

export type CropSegmentInput = {
  label: string
  labelType: LabelType
  boundingBox: BoundingBox
  confidence?: number
  type?: 'GENERATED' | 'MANUAL'
  modelRunId?: string | null
}

export type CropSegmentsRequestDto = {
  inputDir: string
  fileName: string
  segments: CropSegmentInput[]
}

export type SegmentResponse = {
  id: string
  label: string
  labelType: LabelType
  boundingBox: BoundingBox
  confidence: number
  originalPath: string
  modifiedPath: string
  changed: boolean
  type: 'GENERATED' | 'MANUAL'
  humanModified: boolean
  fileId: string
  createdAt: string
  updatedAt: string
}

export type CropSegmentsResultDto = {
  success: boolean
  message: string
  fileId: string
}

export type AdjustSegmentRequest = {
  segmentId: string
  brightness: number
  contrast: number
  sharpness: number
}

export type AdjustSegmentResult = {
  success: boolean
  message: string
  outputPath: string
}

export type SegmentModelProcessRequest = {
  segmentId: string
}

export type SegmentModelProcessResult = {
  success: boolean
  message: string
  outputPath: string
}

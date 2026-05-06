export type LayoutIdentificationProcessRequestDto = {
  inputDir: string
  fileName: string
  modelRunId?: string
}

export type BoundingBox = {
  x1: number
  y1: number
  x2: number
  y2: number
}

export enum LabelType {
  TEXT = 'text',
  NON_TEXT = 'non-text',
}

export type Segment = {
  id: string
  label: string
  labelType: LabelType
  confidence: number
  boundingBox: BoundingBox
}

export type LayoutIdentificationProcessingResultDto = {
  success: boolean
  message: string
  segments: Segment[]
}

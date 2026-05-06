export type AiModel = {
  id: string
  name: string
  path: string | null
}

export type AiModelDictionary = {
  imageEnhancement: AiModel[]
  layoutIdentification: AiModel[]
  segmentManagement: AiModel[]
  ocr: AiModel[]
  postOcrCorrection: AiModel[]
}

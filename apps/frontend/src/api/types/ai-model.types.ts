export type ModelType = 'BUILTIN' | 'HUGGINGFACE' | 'LITELLM'

export type LlmConfig = {
  model: string
  defaultPrompt: string
  outputFormatPrompt?: string
  apiBase?: string
  parameters?: Record<string, unknown>
}

export type AiModel = {
  id: string
  name: string
  path: string | null
  type?: ModelType
  llmConfig?: LlmConfig
}

export type AiModelDictionary = {
  imageEnhancement: AiModel[]
  layoutIdentification: AiModel[]
  segmentManagement: AiModel[]
  ocr: AiModel[]
  postOcrCorrection: AiModel[]
}

export type ImageEnhancementProcessRequestDto = {
  inputDir: string
  fileName: string
  outputDir: string
  modelRunId?: string
}

export type ImageEnhancementProcessingResultDto = {
  success: boolean
  message: string
  outputPath: string
}

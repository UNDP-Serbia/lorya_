export type AiResponseDto = {
  success: boolean
  message: string
  outputPath?: string
}

export type CropImageRequestDto = {
  inputDir: string
  fileName: string
  topLeft: {
    x: number
    y: number
  }
  bottomRight: {
    x: number
    y: number
  }
  outputDir: string
}

export type RotateImageRequestDto = {
  inputDir: string
  fileName: string
  angle: number
  outputDir: string
}

export type AdjustRequestDto = {
  inputDir: string
  fileName: string
  brightness: number
  contrast: number
  sharpness: number
  outputDir: string
}

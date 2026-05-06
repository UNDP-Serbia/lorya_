import { restClient } from '../client'
import type {
  PostOcrCorrectionProcessingResultDto,
  PostOcrCorrectionResultsResponseDto,
  RevertRequestDto,
  RevertResponseDto,
  SaveWordEditRequestDto,
} from '../types'

const base = '/ai/models/post-ocr-corrections'

export const postOcrCorrectionEndpoints = {
  process: async (
    slug: string,
    body: { inputDir: string; fileName: string; modelRunId?: string }
  ): Promise<PostOcrCorrectionProcessingResultDto> => {
    const res = await restClient.post<PostOcrCorrectionProcessingResultDto>(
      `${base}/${slug}/process`,
      body
    )
    return res.data
  },

  getResults: async (
    fileId: string
  ): Promise<PostOcrCorrectionResultsResponseDto> => {
    const res = await restClient.get<PostOcrCorrectionResultsResponseDto>(
      `${base}/results/${fileId}`
    )
    return res.data
  },

  revert: async (body: RevertRequestDto): Promise<RevertResponseDto> => {
    const res = await restClient.post<RevertResponseDto>(`${base}/revert`, body)
    return res.data
  },

  saveWordEdit: async (
    body: SaveWordEditRequestDto
  ): Promise<{ success: boolean }> => {
    const res = await restClient.patch<{ success: boolean }>(
      `${base}/word`,
      body
    )
    return res.data
  },
}

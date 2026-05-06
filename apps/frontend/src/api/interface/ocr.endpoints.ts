import { restClient } from '../client'
import type {
  OcrProcessingResultDto,
  OcrProcessRequestDto,
  OcrResultsResponseDto,
  RevertRequestDto,
  RevertResponseDto,
  SaveWordEditRequestDto,
} from '../types'

const base = '/ai/models/ocrs'

export const ocrEndpoints = {
  process: async (
    slug: string,
    body: OcrProcessRequestDto
  ): Promise<OcrProcessingResultDto> => {
    const res = await restClient.post<OcrProcessingResultDto>(
      `${base}/${slug}/process`,
      body
    )
    return res.data
  },

  getResults: async (fileId: string): Promise<OcrResultsResponseDto> => {
    const res = await restClient.get<OcrResultsResponseDto>(
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

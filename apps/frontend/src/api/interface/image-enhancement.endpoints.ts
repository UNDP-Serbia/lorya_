import { restClient } from '../client'
import type {
  ImageEnhancementProcessingResultDto,
  ImageEnhancementProcessRequestDto,
  RevertRequestDto,
  RevertResponseDto,
} from '../types'

const base = '/ai/models/image-enhancements'

export const imageEnhancementEndpoints = {
  process: async (
    slug: string,
    body: ImageEnhancementProcessRequestDto
  ): Promise<ImageEnhancementProcessingResultDto> => {
    const res = await restClient.post<ImageEnhancementProcessingResultDto>(
      `${base}/${slug}/process`,
      body
    )
    return res.data
  },

  revert: async (body: RevertRequestDto): Promise<RevertResponseDto> => {
    const res = await restClient.post<RevertResponseDto>(`${base}/revert`, body)
    return res.data
  },
}

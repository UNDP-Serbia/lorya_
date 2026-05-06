import { restClient } from '../client'
import type {
  AdjustRequestDto,
  AiResponseDto,
  CropImageRequestDto,
  RotateImageRequestDto,
} from '../types'

const base = '/ai/image'

export const aiEndpoints = {
  cropImage: async (dto: CropImageRequestDto) => {
    const response = await restClient.post<AiResponseDto>(`${base}/crop`, dto)
    return response.data
  },
  rotateImage: async (dto: RotateImageRequestDto) => {
    const response = await restClient.post<AiResponseDto>(`${base}/rotate`, dto)
    return response.data
  },
  adjustImage: async (dto: AdjustRequestDto) => {
    const response = await restClient.post<AiResponseDto>(`${base}/adjust`, dto)
    return response.data
  },
}

import { restClient } from '../client'
import type {
  LayoutIdentificationProcessingResultDto,
  LayoutIdentificationProcessRequestDto,
} from '../types'

const base = '/ai/models/layout-identifications'

export const layoutIdentificationEndpoints = {
  process: async (
    slug: string,
    body: LayoutIdentificationProcessRequestDto
  ): Promise<LayoutIdentificationProcessingResultDto> => {
    const res = await restClient.post<LayoutIdentificationProcessingResultDto>(
      `${base}/${slug}/process`,
      body
    )
    return res.data
  },
}

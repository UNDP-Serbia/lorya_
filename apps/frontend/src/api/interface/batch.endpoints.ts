import { restClient } from '../client'
import type { ValidateBatchRequestDto, ValidateBatchResultDto } from '../types'

const base = '/ai/models/batch'

export const batchEndpoints = {
  validate: async (
    body: ValidateBatchRequestDto
  ): Promise<ValidateBatchResultDto> => {
    const res = await restClient.post<ValidateBatchResultDto>(
      `${base}/validate`,
      body
    )
    return res.data
  },
}

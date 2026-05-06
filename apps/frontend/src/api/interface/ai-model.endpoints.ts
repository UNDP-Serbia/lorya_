import { restClient } from '../client'
import type { AiModelDictionary } from '../types'

const base = '/ai/models'

export const aiModelEndpoints = {
  getModelDictionary: async (): Promise<AiModelDictionary> => {
    const res = await restClient.get<AiModelDictionary>(base)
    return res.data
  },
}

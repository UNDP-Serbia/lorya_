import { restClient } from '../client'
import type { ActivityDto } from '../types'

const base = '/activity'

export const activityEndpoints = {
  getByFile: async (fileId: string): Promise<ActivityDto[]> => {
    const res = await restClient.get<ActivityDto[]>(`${base}/file/${fileId}`)
    return res.data
  },
}

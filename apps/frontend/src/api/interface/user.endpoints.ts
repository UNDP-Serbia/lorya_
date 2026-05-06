import { restClient } from '../client'
import { type User } from '../types'

export const userEndpoints = {
  getAll: async (): Promise<User[]> => {
    const res = await restClient.get('/accounts')
    return res.data as User[]
  },
}

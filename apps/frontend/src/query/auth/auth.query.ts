import { useQuery } from '@tanstack/react-query'
import { AuthQueryKeys } from './auth.keys'
import { jwtDecode } from 'jwt-decode'
import { storageUtils } from '../../utils'
import { StorageKey } from '../../api'

interface JwtPayload {
  exp?: number
  [key: string]: any
}

export const useAuthenticated = () =>
  useQuery<boolean, Error>({
    queryKey: [AuthQueryKeys.authenticated],
    queryFn: async () => {
      const token = await storageUtils.get<string | null>(StorageKey.TOKEN)
      if (!token) return false

      try {
        const payload: JwtPayload = jwtDecode(token)
        if (!payload.exp) return false
        const now = Date.now() / 1000

        return payload.exp > now
      } catch (e) {
        console.error(e)
        return false
      }
    },
  })

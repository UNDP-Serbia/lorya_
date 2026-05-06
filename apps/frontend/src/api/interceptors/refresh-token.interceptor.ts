import {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
  isAxiosError,
  AxiosHeaders,
} from 'axios'
import { storageUtils } from '../../utils'
import { StorageKey } from '../types'
import { queryClient } from '../../query'
import { AuthQueryKeys, QueryClientKeys } from '../../query'

// Helper types and guards
type AuthTokens = {
  accessToken?: string
  refreshToken?: string
}

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  // Relax header typing for setting Authorization in a type-safe way
  headers?: Record<string, string>
}

const getAuthHeader = (headers: unknown): string | undefined => {
  if (headers && typeof headers === 'object') {
    const h = headers as Record<string, unknown>
    const v = h['authorization'] as string | undefined
    return typeof v === 'string' ? v : undefined
  }
  return undefined
}

const getAccessTokenFromData = (data: unknown): string | undefined => {
  if (data && typeof data === 'object') {
    const d = data as Partial<AuthTokens>
    return typeof d.accessToken === 'string' ? d.accessToken : undefined
  }
  return undefined
}

const getRefreshTokenFromData = (data: unknown): string | undefined => {
  if (data && typeof data === 'object') {
    const d = data as Partial<AuthTokens>
    return typeof d.refreshToken === 'string' ? d.refreshToken : undefined
  }
  return undefined
}

export const refreshToken = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.response.use(
    async (response: AxiosResponse<unknown>) => {
      const authHeader = getAuthHeader(response.headers)
      let token: string | undefined

      if (
        typeof authHeader === 'string' &&
        authHeader.toLowerCase().startsWith('bearer ')
      ) {
        token = authHeader.split(' ')[1]
      } else {
        token = getAccessTokenFromData(response.data)
      }

      if (token) {
        axiosInstance.defaults.headers.common['Authorization'] =
          `Bearer ${token}`
        await storageUtils.set(StorageKey.TOKEN, token)
        await queryClient.invalidateQueries({
          queryKey: AuthQueryKeys.authenticated,
          refetchType: 'all',
        })
      }

      return response
    },

    async (error: unknown) => {
      if (!isAxiosError(error)) {
        return Promise.reject(
          error instanceof Error ? error : new Error(String(error))
        )
      }

      const originalRequest: RetriableRequestConfig = (error.config ??
        {}) as RetriableRequestConfig
      const status = error.response?.status
      const url: string = originalRequest.url ?? ''

      if (
        status !== 401 ||
        originalRequest._retry ||
        url.includes('/auth/refresh')
      ) {
        return Promise.reject(
          error instanceof Error ? error : new Error(String(error))
        )
      }

      originalRequest._retry = true

      try {
        const refreshTokenValue = await storageUtils.get<string | null>(
          StorageKey.REFRESH_TOKEN
        )
        const currentToken = await storageUtils.get<string | null>(
          StorageKey.TOKEN
        )

        if (!refreshTokenValue) {
          throw new Error('No refresh token found')
        }

        const refreshResponse = await axiosInstance.post<AuthTokens>(
          '/auth/refresh',
          { refreshToken: refreshTokenValue },
          {
            headers: {
              Authorization: currentToken ? `Bearer ${currentToken}` : '',
            },
          }
        )

        const headerToken = getAuthHeader(refreshResponse.headers)
        const bodyToken = getAccessTokenFromData(refreshResponse.data)
        const newToken =
          bodyToken ??
          (typeof headerToken === 'string' && headerToken.includes(' ')
            ? headerToken.split(' ')[1]
            : undefined)

        const newRefreshToken = getRefreshTokenFromData(refreshResponse.data)

        if (newToken) {
          axiosInstance.defaults.headers.common['Authorization'] =
            `Bearer ${newToken}`
          await storageUtils.set(StorageKey.TOKEN, newToken)
          if (newRefreshToken) {
            await storageUtils.set(StorageKey.REFRESH_TOKEN, newRefreshToken)
          }

          await queryClient.invalidateQueries({
            queryKey: AuthQueryKeys.authenticated,
            refetchType: 'all',
          })

          if (!originalRequest.headers) {
            originalRequest.headers = new AxiosHeaders()
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return axiosInstance(originalRequest as unknown as AxiosRequestConfig)
        }

        throw new Error('No token in refresh response')
      } catch (refreshError) {
        await storageUtils.removeMultiple([
          StorageKey.TOKEN,
          StorageKey.REFRESH_TOKEN,
        ])
        await queryClient.invalidateQueries({
          queryKey: QueryClientKeys.all,
          refetchType: 'all',
        })
        return Promise.reject(
          refreshError instanceof Error
            ? refreshError
            : new Error(String(refreshError))
        )
      }
    }
  )
}

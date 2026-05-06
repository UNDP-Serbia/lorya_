import { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { StorageKey } from '../types'
import { storageUtils } from '../../utils'

export const requestInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await storageUtils.get<string | null>(StorageKey.TOKEN)
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
      // If sending FormData, let the browser set the Content-Type with the boundary
      if (config.data instanceof FormData) {
        // AxiosHeaders supports delete via bracket access
        config.headers?.delete?.('Content-Type')
      }
      return config
    },
    error => {
      if (error instanceof Error) return Promise.reject(error)
      const message = typeof error === 'string' ? error : JSON.stringify(error)
      return Promise.reject(new Error(message))
    }
  )
}

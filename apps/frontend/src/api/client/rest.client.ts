import axios from 'axios'
import {
  refreshToken,
  requestInterceptor,
  responseInterceptor,
} from '../interceptors'

export const restClient = axios.create({
  baseURL:
    (import.meta.env.VITE_API_URL as string) || 'http://lorya.online/api/v1', // FIXME: remove hardcoded URL after setting up server
  headers: {
    'Content-Type': 'application/json',
  },
})

requestInterceptor(restClient)
responseInterceptor(restClient)
refreshToken(restClient)

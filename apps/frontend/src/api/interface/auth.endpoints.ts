import { restClient } from '../client'
import { type AuthRequestDto, type RefreshDto } from '../types'

export const authEndpoints = {
  login: (dto: AuthRequestDto) => restClient.post('/auth/login', dto),
  register: (dto: AuthRequestDto) => restClient.post('/auth/register', dto),
  refresh: (dto: RefreshDto) => restClient.post('/auth/refresh', dto),
  me: () => restClient.get('/auth/me'),
}

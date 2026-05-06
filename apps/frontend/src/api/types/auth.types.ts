export type AuthRequestDto = {
  email: string
  password: string
}

export type AuthResponseDto = {
  accessToken: string
  refreshToken: string
}

export type RefreshDto = {
  refreshToken: string
}

export const StorageKey = {
  TOKEN: 'lryToken',
  REFRESH_TOKEN: 'lryRefreshToken',
}

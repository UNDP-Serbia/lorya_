import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { AuthMutationKeys } from './auth.keys'
import { authEndpoints } from '../../api'
import {
  type AuthRequestDto,
  type AuthResponseDto,
  StorageKey,
} from '../../api'
import { storageUtils } from '../../utils'
import { queryClient } from '../client'
import { AuthQueryKeys } from './auth.keys'
import { type User } from '../../api'

export const useSignIn = (
  options: UseMutationOptions<AuthResponseDto, Error, AuthRequestDto> = {}
) =>
  useMutation<AuthResponseDto, Error, AuthRequestDto>({
    mutationKey: AuthMutationKeys.signIn,
    mutationFn: async (payload: AuthRequestDto): Promise<AuthResponseDto> => {
      const response = await authEndpoints.login(payload)
      const { accessToken, refreshToken } = response.data as AuthResponseDto
      // const accessToken: string = res.data?.accessToken || ''
      // const refreshToken: string = res.data?.refreshToken || ''
      if (accessToken)
        await storageUtils.set<string>(StorageKey.TOKEN, accessToken)
      if (refreshToken)
        await storageUtils.set<string>(StorageKey.REFRESH_TOKEN, refreshToken)
      await queryClient.invalidateQueries({
        queryKey: AuthQueryKeys.authenticated,
        refetchType: 'all',
      })
      await queryClient.invalidateQueries({
        queryKey: AuthQueryKeys.currentUser,
        refetchType: 'all',
      })
      return { accessToken, refreshToken }
    },
    ...options,
  })

export const useSignUp = (
  options: UseMutationOptions<{ data: User }, Error, AuthRequestDto> = {}
) =>
  useMutation<{ data: User }, Error, AuthRequestDto>({
    mutationKey: AuthMutationKeys.signUp,
    mutationFn: async (payload: AuthRequestDto) => {
      const res = await authEndpoints.register(payload)
      const data: User = res?.data as User
      await queryClient.invalidateQueries({
        queryKey: AuthQueryKeys.authenticated,
        refetchType: 'all',
      })
      return { data }
    },
    ...options,
  })

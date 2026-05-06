import { useMutation } from '@tanstack/react-query'
import type { UseMutationOptions } from '@tanstack/react-query'
import type { AdjustRequestDto, RotateImageRequestDto } from '../../api'
import type { CropImageRequestDto } from '../../api'
import { AiMutationKeys } from './ai.keys'
import { aiEndpoints } from '../../api/interface/ai.endpoints'

export const useCropImage = (
  options?: UseMutationOptions<void, Error, CropImageRequestDto>
) => {
  return useMutation<void, Error, CropImageRequestDto>({
    ...options,
    mutationKey: AiMutationKeys.cropImage,
    mutationFn: async payload => {
      await aiEndpoints.cropImage(payload)
    },
  })
}

export const useRotateImage = (
  options?: UseMutationOptions<void, Error, RotateImageRequestDto>
) => {
  return useMutation<void, Error, RotateImageRequestDto>({
    ...options,
    mutationKey: AiMutationKeys.rotateImage,
    mutationFn: async payload => {
      await aiEndpoints.rotateImage(payload)
    },
  })
}

export const useAdjustImage = (
  options?: UseMutationOptions<void, Error, AdjustRequestDto>
) => {
  return useMutation<void, Error, AdjustRequestDto>({
    ...options,
    mutationKey: AiMutationKeys.adjustImage,
    mutationFn: async payload => {
      await aiEndpoints.adjustImage(payload)
    },
  })
}

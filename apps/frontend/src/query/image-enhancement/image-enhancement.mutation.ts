import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { ImageEnhancementMutationKeys } from './image-enhancement.keys'
import {
  imageEnhancementEndpoints,
  type ImageEnhancementProcessRequestDto,
  type RevertRequestDto,
  type RevertResponseDto,
} from '../../api'

export const useImageEnhancementProcess = (
  options: UseMutationOptions<
    void,
    Error,
    ImageEnhancementProcessRequestDto & { slug: string }
  > = {}
) => {
  return useMutation<
    void,
    Error,
    ImageEnhancementProcessRequestDto & { slug: string }
  >({
    ...options,
    mutationKey: ImageEnhancementMutationKeys.process,
    mutationFn: async ({ slug, ...payload }) => {
      await imageEnhancementEndpoints.process(slug, payload)
    },
  })
}

export const useRevertImageEnhancement = (
  options?: UseMutationOptions<RevertResponseDto, Error, RevertRequestDto>
) =>
  useMutation({
    mutationKey: ImageEnhancementMutationKeys.revert,
    mutationFn: (data: RevertRequestDto) =>
      imageEnhancementEndpoints.revert(data),
    ...options,
  })

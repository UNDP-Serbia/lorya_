import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { LayoutIdentificationMutationKeys } from './layout-identification.keys'
import {
  layoutIdentificationEndpoints,
  type LayoutIdentificationProcessRequestDto,
  type LayoutIdentificationProcessingResultDto,
} from '../../api'

export const useLayoutIdentificationProcess = (
  options: UseMutationOptions<
    LayoutIdentificationProcessingResultDto,
    Error,
    LayoutIdentificationProcessRequestDto & { slug: string }
  > = {}
) => {
  return useMutation<
    LayoutIdentificationProcessingResultDto,
    Error,
    LayoutIdentificationProcessRequestDto & { slug: string }
  >({
    ...options,
    mutationKey: LayoutIdentificationMutationKeys.process,
    mutationFn: async ({ slug, ...payload }) => {
      return layoutIdentificationEndpoints.process(slug, payload)
    },
  })
}

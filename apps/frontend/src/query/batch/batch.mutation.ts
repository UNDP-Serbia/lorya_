import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { BatchMutationKeys } from './batch.keys'
import {
  batchEndpoints,
  type ValidateBatchRequestDto,
  type ValidateBatchResultDto,
} from '../../api'

export const useBatchValidate = (
  options: UseMutationOptions<
    ValidateBatchResultDto,
    Error,
    ValidateBatchRequestDto
  > = {}
) => {
  return useMutation<ValidateBatchResultDto, Error, ValidateBatchRequestDto>({
    ...options,
    mutationKey: BatchMutationKeys.validate,
    mutationFn: async payload => {
      return batchEndpoints.validate(payload)
    },
  })
}

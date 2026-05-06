import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ModelCategory } from '../../utils/model-category'
import type { CreateModelInput } from '../../api/interface/ai-models'
import { endpointsFor, modelsQueryKey } from './types'

export function useCreateModel(category: ModelCategory) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateModelInput) =>
      endpointsFor(category).create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: modelsQueryKey(category) })
    },
  })
}

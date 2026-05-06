import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ModelCategory } from '../../utils/model-category'
import type { UpdateModelInput } from '../../api/interface/ai-models'
import { endpointsFor, modelQueryKey, modelsQueryKey } from './types'

export function useUpdateModel(category: ModelCategory) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateModelInput }) =>
      endpointsFor(category).update(id, input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: modelsQueryKey(category) })
      qc.invalidateQueries({
        queryKey: modelQueryKey(category, variables.id),
      })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ModelCategory } from '../../utils/model-category'
import { endpointsFor, modelsQueryKey } from './types'

export function useDeleteModel(category: ModelCategory) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => endpointsFor(category).delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: modelsQueryKey(category) })
    },
  })
}

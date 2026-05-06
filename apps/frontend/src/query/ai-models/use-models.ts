import { useQuery } from '@tanstack/react-query'
import type { ModelCategory } from '../../utils/model-category'
import { endpointsFor, modelsQueryKey } from './types'

export function useModels(category: ModelCategory) {
  return useQuery({
    queryKey: modelsQueryKey(category),
    queryFn: () => endpointsFor(category).list(),
  })
}

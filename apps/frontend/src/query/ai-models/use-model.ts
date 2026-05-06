import { useQuery } from '@tanstack/react-query'
import type { ModelCategory } from '../../utils/model-category'
import { endpointsFor, modelQueryKey } from './types'

export function useModel(category: ModelCategory, id: string | undefined) {
  return useQuery({
    queryKey: modelQueryKey(category, id ?? ''),
    queryFn: () => endpointsFor(category).get(id!),
    enabled: Boolean(id),
  })
}

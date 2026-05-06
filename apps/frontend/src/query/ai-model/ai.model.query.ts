import { useQuery } from '@tanstack/react-query'
import { queryClient } from '../client'
import { AiModelQueryKeys } from './ai-model.keys'
import { aiModelEndpoints } from '../../api/interface'

const aiModelsQueryOptions = {
  queryKey: AiModelQueryKeys.all,
  queryFn: aiModelEndpoints.getModelDictionary,
}

export const useAiModels = () => useQuery(aiModelsQueryOptions)

export const prefetchAiModels = () =>
  queryClient.prefetchQuery(aiModelsQueryOptions)

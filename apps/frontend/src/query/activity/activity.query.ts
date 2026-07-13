import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { activityEndpoints, type ActivityDto } from '../../api'
import { ActivityQueryKeys } from './activity.keys'

export const useFileActivity = (
  fileId: string | null,
  options?: Omit<
    UseQueryOptions<ActivityDto[], Error, ActivityDto[]>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) =>
  useQuery<ActivityDto[], Error, ActivityDto[]>({
    queryKey: ActivityQueryKeys.byFile(fileId),
    queryFn: () => activityEndpoints.getByFile(fileId as string),
    meta: { suppressGlobalLoader: true },
    enabled: !!fileId,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    ...options,
  })

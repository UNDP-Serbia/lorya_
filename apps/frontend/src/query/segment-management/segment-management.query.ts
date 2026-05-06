import { useQuery, useQueryClient } from '@tanstack/react-query'
import { SegmentManagementQueryKeys } from './segment-management.keys'
import { segmentManagementEndpoints, type SegmentResponse } from '../../api'

export const useFileSegments = (fileId: string | null) => {
  return useQuery<SegmentResponse[], Error>({
    queryKey: SegmentManagementQueryKeys.segments(fileId!),
    queryFn: () => segmentManagementEndpoints.getSegments(fileId!),
    enabled: !!fileId,
  })
}

export const usePrefetchFileSegments = () => {
  const queryClient = useQueryClient()

  return (fileId: string) => {
    void queryClient.prefetchQuery({
      queryKey: SegmentManagementQueryKeys.segments(fileId),
      queryFn: () => segmentManagementEndpoints.getSegments(fileId),
    })
  }
}

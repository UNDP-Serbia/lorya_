import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import {
  runHistoryEndpoints,
  type ModelRunCompletedDto,
  type RunHistoryListQueryDto,
  type RunHistoryListResponseDto,
  type RunHistorySegmentDto,
  type StartModelRunDto,
  type StartModelRunResponseDto,
} from '../../api'
import { RunHistoryQueryKeys } from './run-history.keys'

export const useRunHistory = (
  query: RunHistoryListQueryDto = {},
  options?: Omit<
    UseQueryOptions<RunHistoryListResponseDto, Error>,
    'queryKey' | 'queryFn'
  >
) =>
  useQuery<RunHistoryListResponseDto, Error>({
    queryKey: RunHistoryQueryKeys.list(query),
    queryFn: () => runHistoryEndpoints.list(query),
    ...options,
  })

export const useRunFileSegments = (
  modelRunId: string | null,
  fileId: string | null,
  options?: Omit<
    UseQueryOptions<RunHistorySegmentDto[], Error>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) =>
  useQuery<RunHistorySegmentDto[], Error>({
    queryKey: RunHistoryQueryKeys.segments(modelRunId, fileId),
    queryFn: () =>
      runHistoryEndpoints.getFileSegments(
        modelRunId as string,
        fileId as string
      ),
    enabled: !!modelRunId && !!fileId,
    ...options,
  })

export const useStartModelRun = (
  options?: UseMutationOptions<
    StartModelRunResponseDto,
    Error,
    StartModelRunDto
  >
) =>
  useMutation<StartModelRunResponseDto, Error, StartModelRunDto>({
    mutationFn: body => runHistoryEndpoints.start(body),
    ...options,
  })

export const useCompleteModelRun = (
  options?: UseMutationOptions<ModelRunCompletedDto, Error, string>
) =>
  useMutation<ModelRunCompletedDto, Error, string>({
    mutationFn: modelRunId => runHistoryEndpoints.complete(modelRunId),
    ...options,
  })

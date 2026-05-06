import { restClient } from '../client'
import type {
  ModelRunCompletedDto,
  RunHistoryListQueryDto,
  RunHistoryListResponseDto,
  RunHistorySegmentDto,
  StartModelRunDto,
  StartModelRunResponseDto,
} from '../types'

const base = '/run-history'

export const runHistoryEndpoints = {
  list: async (
    query: RunHistoryListQueryDto
  ): Promise<RunHistoryListResponseDto> => {
    const res = await restClient.get<RunHistoryListResponseDto>(base, {
      params: query,
    })
    return res.data
  },
  getFileSegments: async (
    modelRunId: string,
    fileId: string
  ): Promise<RunHistorySegmentDto[]> => {
    const res = await restClient.get<RunHistorySegmentDto[]>(
      `${base}/${modelRunId}/files/${fileId}/segments`
    )
    return res.data
  },
  start: async (body: StartModelRunDto): Promise<StartModelRunResponseDto> => {
    const res = await restClient.post<StartModelRunResponseDto>(
      `${base}/start`,
      body
    )
    return res.data
  },
  complete: async (modelRunId: string): Promise<ModelRunCompletedDto> => {
    const res = await restClient.post<ModelRunCompletedDto>(
      `${base}/${modelRunId}/complete`
    )
    return res.data
  },
}

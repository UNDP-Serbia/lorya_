import { QueryClientKeys } from '../base.keys'
import type { RunHistoryListQueryDto } from '../../api'

export const RunHistoryQueryKeys = {
  all: [...QueryClientKeys.all, 'run-history'] as const,
  list: (query: RunHistoryListQueryDto) =>
    [...RunHistoryQueryKeys.all, 'list', query] as const,
  segments: (modelRunId: string | null, fileId: string | null) =>
    [
      ...RunHistoryQueryKeys.all,
      'segments',
      modelRunId ?? 'none',
      fileId ?? 'none',
    ] as const,
}

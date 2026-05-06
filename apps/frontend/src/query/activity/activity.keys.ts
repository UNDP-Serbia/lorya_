import { QueryClientKeys } from '../base.keys'

export const ActivityQueryKeys = {
  all: [...QueryClientKeys.all, 'activity'] as const,
  byFile: (fileId: string | null) =>
    [...ActivityQueryKeys.all, 'file', fileId ?? 'none'] as const,
}

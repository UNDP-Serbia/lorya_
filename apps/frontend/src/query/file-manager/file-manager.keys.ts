import { QueryClientKeys } from '../base.keys'

export const FileManagerQueryKeys = {
  all: [...QueryClientKeys.all, 'file-manager'] as const,
  entries: (path?: string) =>
    [...FileManagerQueryKeys.all, 'entries', path ?? 'root'] as const,
}

const ALL_MUTATIONS = [...FileManagerQueryKeys.all, 'mutations']

export const FileManagerMutationKeys = {
  all: ALL_MUTATIONS,
  reset: [...ALL_MUTATIONS, 'reset'],
  export: (type: string) => [...ALL_MUTATIONS, 'export', type],
  download: [...ALL_MUTATIONS, 'download'],
}

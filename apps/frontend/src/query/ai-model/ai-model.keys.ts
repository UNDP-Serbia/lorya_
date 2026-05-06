import { QueryClientKeys } from '../base.keys'

const ALL = [...QueryClientKeys.all, 'ai', 'models'] as const

export const AiModelQueryKeys = {
  all: ALL,
}

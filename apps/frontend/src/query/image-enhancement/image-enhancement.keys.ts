import { QueryClientKeys } from '../base.keys'

const ALL = [...QueryClientKeys.all, 'image-enhancement']

export const ImageEnhancementMutationKeys = {
  process: [...ALL, 'process'],
  revert: [...ALL, 'revert'],
}

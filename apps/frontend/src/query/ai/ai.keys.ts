import { QueryClientKeys } from '../base.keys'

const ALL = [...QueryClientKeys.all, 'ai']

export const AiQueryKeys = {
  all: ALL,
}

export const AiMutationKeys = {
  cropImage: [...ALL, 'cropImage'],
  rotateImage: [...ALL, 'rotateImage'],
  adjustImage: [...ALL, 'adjustImage'],
  runImageEnhancement: [...ALL, 'runImageEnhancement'],
}

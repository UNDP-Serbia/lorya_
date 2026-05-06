import { QueryClientKeys } from '../base.keys'

const ALL = [...QueryClientKeys.all, 'post-ocr-correction'] as const

export const PostOcrCorrectionQueryKeys = {
  all: ALL,
  results: (fileId: string) => [...ALL, 'results', fileId] as const,
}

export const PostOcrCorrectionMutationKeys = {
  process: [...ALL, 'process'],
  revert: [...ALL, 'revert'],
  saveWordEdit: [...ALL, 'save-word-edit'],
}

import { QueryClientKeys } from '../base.keys'

const ALL = [...QueryClientKeys.all, 'ocr'] as const

export const OcrQueryKeys = {
  all: ALL,
  results: (fileId: string) => [...ALL, 'results', fileId] as const,
}

export const OcrMutationKeys = {
  process: [...ALL, 'process'],
  revert: [...ALL, 'revert'],
  saveWordEdit: [...ALL, 'save-word-edit'],
}

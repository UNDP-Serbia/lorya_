import { FileStatus } from './types'

const STATUS_ORDER = [
  FileStatus.INITIALIZED,
  FileStatus.SEGMENTED,
  FileStatus.OCR_COMPLETED,
  FileStatus.POST_OCR_COMPLETED,
  FileStatus.COMPLETED,
]

export const isAtLeast = (
  current: FileStatus,
  threshold: FileStatus
): boolean => STATUS_ORDER.indexOf(current) >= STATUS_ORDER.indexOf(threshold)

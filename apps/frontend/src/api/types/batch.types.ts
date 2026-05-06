import type { FileStatus } from './file-manager.types'

export type ValidateBatchRequestDto = {
  fileIds: string[]
}

export type InvalidFileDto = {
  fileId: string
  status: FileStatus
}

export type ValidateBatchResultDto = {
  valid: boolean
  status: FileStatus
  invalidFiles?: InvalidFileDto[]
}

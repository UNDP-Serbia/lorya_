export enum FileStatus {
  INITIALIZED = 'INITIALIZED',
  SEGMENTED = 'SEGMENTED',
  OCR_COMPLETED = 'OCR_COMPLETED',
  POST_OCR_COMPLETED = 'POST_OCR_COMPLETED',
  COMPLETED = 'COMPLETED',
}

export type EntryType = 'file' | 'directory'

export interface FileManagerEntry {
  name: string
  path: string
  type: EntryType
  size?: number
  modifiedAt?: string // ISO string
  children?: FileManagerEntry[]
  fileId?: string
  status?: FileStatus
  metadata?: {
    imageEnhancement: {
      confidence: number | null
      humanModified: boolean
      imageModified: boolean
    }
    layoutIdentification: {
      confidence: number | null
      humanModified: boolean
    }
    ocr: {
      confidence: number | null
      humanModified: boolean
    }
    postOcr: {
      confidence: number | null
      humanModified: boolean
    }
  }
}

export interface ListEntriesParams {
  path?: string
}

interface RenameEntryDtoItem {
  path: string
  name: string
  type: EntryType
  newName: string
}

type EntireEntryDto = {
  type: EntryType
  path: string
  name: string | undefined
}

type EntryWithNewPathDto = EntireEntryDto & {
  newPath: string
}

export interface DeleteEntriesDto {
  entries: EntireEntryDto[]
}

export interface MoveToEntriesDto {
  entries: EntryWithNewPathDto[]
}

export interface RenameEntryDto {
  entries: RenameEntryDtoItem[]
}

export interface CreateDirectoryDto {
  path: string
  name: string
}

export interface DownloadEntryDto {
  type: EntryType
  path: string
  name: string
}

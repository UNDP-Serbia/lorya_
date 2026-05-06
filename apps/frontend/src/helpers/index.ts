import { AxiosError } from 'axios'
import { type FileManagerEntry } from '../api'

export const buildStorageSrc = (
  baseUrl: string,
  path?: string,
  name?: string
) => {
  if (!baseUrl || !name) return ''

  const cleanBase = baseUrl.replace(/\/+$/, '')
  const cleanPath = (path || '').replace(/^\/+|\/+$/g, '')
  const cleanName = name.replace(/^\/+/, '')

  return cleanPath
    ? `${cleanBase}/${cleanPath}/${cleanName}`
    : `${cleanBase}/${cleanName}`
}

export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosErr = error as AxiosError<{ message: string }>
    return axiosErr.response?.data?.message || 'Something went wrong'
  }
  return 'Something went wrong'
}

type FolderOption = {
  label: string
  value: string
}

export function extractFolderOptions(
  entries: FileManagerEntry[]
): FolderOption[] {
  const result: FolderOption[] = []

  function traverse(entry: FileManagerEntry) {
    if (entry.type === 'directory') {
      result.push({
        label: entry.name,
        value: entry.path + '/' + entry.name,
      })
      for (const child of entry.children || []) {
        traverse(child)
      }
    }
  }

  for (const entry of entries) {
    traverse(entry)
  }

  return result
}

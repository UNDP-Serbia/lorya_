import { restClient } from '../client'
import {
  type CreateDirectoryDto,
  type DeleteEntriesDto,
  type DownloadEntryDto,
  type FileManagerEntry,
  type ListEntriesParams,
  type MoveToEntriesDto,
  type RenameEntryDto,
  type RevertRequestDto,
  type RevertResponseDto,
} from '../types'

const base = '/file-manager/entries'

export const fileManagerEndpoints = {
  listEntries: async (
    params: ListEntriesParams = {}
  ): Promise<FileManagerEntry[]> => {
    const res = await restClient.get(base, { params })
    return res.data as FileManagerEntry[]
  },

  renameEntries: (payload: RenameEntryDto | RenameEntryDto[]) =>
    restClient.put(base, payload),

  patchEntries: (payload: RenameEntryDto | RenameEntryDto[]) =>
    restClient.patch(base, Array.isArray(payload) ? payload : [payload]),

  deleteEntries: (payload: DeleteEntriesDto) =>
    restClient.delete(base, { data: payload }),

  moveToEntries: (payload: MoveToEntriesDto) => restClient.patch(base, payload),

  createDirectory: (payload: CreateDirectoryDto) =>
    restClient.post(`${base}/directory`, payload),

  resetFile: async (body: RevertRequestDto): Promise<RevertResponseDto> => {
    const res = await restClient.post<RevertResponseDto>(`${base}/reset`, body)
    return res.data
  },

  // Upload files (images or PDFs) to a dynamic path with per-file progress via sequential uploads
  uploadFiles: async (
    path: string,
    files: File[],
    onProgress?: (fileIndex: number, percent: number) => void
  ): Promise<FileManagerEntry[]> => {
    const results: FileManagerEntry[] = []
    for (let i = 0; i < files.length; i++) {
      const form = new FormData()
      form.append('path', path || '/')
      form.append('files', files[i])
      const res = await restClient.post(`${base}/files`, form, {
        onUploadProgress: e => {
          if (!onProgress) return
          const total = e.total ?? 0
          const percent = total > 0 ? Math.round((e.loaded * 100) / total) : 0
          onProgress(i, percent)
        },
      })
      results.push(...((res.data as FileManagerEntry[]) || []))
      // Ensure 100% after each file completes
      onProgress?.(i, 100)
    }
    return results
  },

  exportAlto: async (fileId: string): Promise<void> => {
    const res = await restClient.get(`${base}/files/${fileId}/export/alto`, {
      responseType: 'blob',
    })

    const contentDisposition = res.headers['content-disposition'] as
      | string
      | undefined
    const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/)
    const filename = filenameMatch?.[1] ?? 'export.xml'

    const url = window.URL.createObjectURL(res.data as Blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  downloadEntries: async (entries: DownloadEntryDto[]): Promise<void> => {
    const res = await restClient.post(
      `${base}/download`,
      { entries },
      { responseType: 'blob' }
    )

    const contentDisposition = res.headers['content-disposition'] as
      | string
      | undefined
    const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/)
    const filename = filenameMatch
      ? decodeURIComponent(filenameMatch[1])
      : 'Archive.zip'

    const url = window.URL.createObjectURL(res.data as Blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}

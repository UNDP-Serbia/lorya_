import React from 'react'
import type { FileManagerEntry, FileStatus } from '../api'

export type BatchFile = {
  fileId: string
  fileName: string
  path: string
  status: FileStatus
}

type BatchSelectionContextType = {
  selectedFiles: BatchFile[]
  addFile: (entry: FileManagerEntry) => void
  removeFile: (fileId: string) => void
  clearAll: () => void
  batchStatus: FileStatus | null
  updateFileStatuses: (entries: FileManagerEntry[]) => void
}

const BatchSelectionContext =
  React.createContext<BatchSelectionContextType | null>(null)

export const useBatchSelection = () => {
  const ctx = React.useContext(BatchSelectionContext)
  if (!ctx) {
    throw new Error(
      'useBatchSelection must be used within BatchSelectionProvider'
    )
  }
  return ctx
}

export const BatchSelectionProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [selectedFiles, setSelectedFiles] = React.useState<BatchFile[]>([])

  const addFile = React.useCallback((entry: FileManagerEntry) => {
    if (!entry.fileId || entry.type !== 'file') return
    const fileId = entry.fileId
    setSelectedFiles(prev => {
      if (prev.some(f => f.fileId === fileId)) return prev
      return [
        ...prev,
        {
          fileId,
          fileName: entry.name,
          path: entry.path,
          status: (entry.status ?? 'INITIALIZED') as FileStatus,
        },
      ]
    })
  }, [])

  const removeFile = React.useCallback((fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.fileId !== fileId))
  }, [])

  const clearAll = React.useCallback(() => {
    setSelectedFiles([])
  }, [])

  const batchStatus: FileStatus | null =
    selectedFiles.length > 0 ? selectedFiles[0].status : null

  const updateFileStatuses = React.useCallback(
    (entries: FileManagerEntry[]) => {
      setSelectedFiles(prev => {
        const entryMap = new Map<string, FileManagerEntry>()
        const collectEntries = (items: FileManagerEntry[]) => {
          for (const item of items) {
            if (item.fileId) entryMap.set(item.fileId, item)
            if (item.children) collectEntries(item.children)
          }
        }
        collectEntries(entries)

        let changed = false
        const updated = prev.map(f => {
          const entry = entryMap.get(f.fileId)
          if (entry && entry.status && entry.status !== f.status) {
            changed = true
            return { ...f, status: entry.status }
          }
          return f
        })
        return changed ? updated : prev
      })
    },
    []
  )

  const value = React.useMemo(
    () => ({
      selectedFiles,
      addFile,
      removeFile,
      clearAll,
      batchStatus,
      updateFileStatuses,
    }),
    [
      selectedFiles,
      addFile,
      removeFile,
      clearAll,
      batchStatus,
      updateFileStatuses,
    ]
  )

  return (
    <BatchSelectionContext.Provider value={value}>
      {children}
    </BatchSelectionContext.Provider>
  )
}

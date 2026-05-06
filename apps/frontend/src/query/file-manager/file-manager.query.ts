import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import {
  fileManagerEndpoints,
  type CreateDirectoryDto,
  type DownloadEntryDto,
  type FileManagerEntry,
  type ListEntriesParams,
  type RenameEntryDto,
  type RevertRequestDto,
  type RevertResponseDto,
  type DeleteEntriesDto,
  type MoveToEntriesDto,
} from '../../api'
import {
  FileManagerMutationKeys,
  FileManagerQueryKeys,
} from './file-manager.keys'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'
import { getErrorMessage } from '../../helpers'

export const useFileManagerEntries = (
  params: ListEntriesParams = {},
  options?: Omit<
    UseQueryOptions<FileManagerEntry[], Error, FileManagerEntry[]>,
    'queryKey' | 'queryFn'
  >
) =>
  useQuery<FileManagerEntry[], Error, FileManagerEntry[]>({
    queryKey: [...FileManagerQueryKeys.entries(params.path), params] as const,
    queryFn: () => fileManagerEndpoints.listEntries(params),
    ...options,
  })

export const useCreateDirectory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDirectoryDto) =>
      fileManagerEndpoints.createDirectory(payload),
    onSuccess: _res => {
      queryClient.invalidateQueries({
        queryKey: FileManagerQueryKeys.all,
      })
    },
  })
}
export const useDeleteEntries = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: DeleteEntriesDto) =>
      fileManagerEndpoints.deleteEntries(payload),
    onSuccess: _res => {
      queryClient.invalidateQueries({
        queryKey: FileManagerQueryKeys.all,
      })
    },
  })
}
export const useMoveToEntries = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: MoveToEntriesDto) =>
      fileManagerEndpoints.moveToEntries(payload),
    onSuccess: _res => {
      queryClient.invalidateQueries({
        queryKey: FileManagerQueryKeys.all,
      })
    },
    onError: (error: Error) => {
      const axiosError = error as AxiosError<any>
      const message = getErrorMessage(axiosError)
      toast.error(message)
    },
  })
}

export const useRenameEntries = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RenameEntryDto | RenameEntryDto[]) =>
      fileManagerEndpoints.renameEntries(payload),
    onSuccess: _res => {
      void queryClient.invalidateQueries({
        queryKey: FileManagerQueryKeys.all,
      })
    },
    onError: (error: Error) => {
      const axiosError = error as AxiosError<any>
      const message = getErrorMessage(axiosError)
      toast.error(message)
    },
  })
}

export const useUploadFiles = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      path: string
      files: File[]
      onProgress?: (fileIndex: number, percent: number) => void
    }) =>
      fileManagerEndpoints.uploadFiles(
        payload.path,
        payload.files,
        payload.onProgress
      ),
    onSuccess: (_res, variables) => {
      // Invalidate listing for the target directory
      void queryClient.invalidateQueries({
        queryKey: FileManagerQueryKeys.entries(variables.path || '/'),
      })
    },
  })
}

export const useResetFile = (
  options?: UseMutationOptions<RevertResponseDto, Error, RevertRequestDto>
) =>
  useMutation({
    mutationKey: FileManagerMutationKeys.reset,
    mutationFn: (data: RevertRequestDto) =>
      fileManagerEndpoints.resetFile(data),
    ...options,
  })

export const useExportAlto = (
  options?: UseMutationOptions<void, Error, string>
) =>
  useMutation({
    mutationKey: FileManagerMutationKeys.export('alto'),
    mutationFn: (fileId: string) => fileManagerEndpoints.exportAlto(fileId),
    ...options,
  })

export const useDownloadEntries = (
  options?: UseMutationOptions<void, Error, DownloadEntryDto[]>
) =>
  useMutation({
    mutationKey: FileManagerMutationKeys.download,
    mutationFn: (entries: DownloadEntryDto[]) =>
      fileManagerEndpoints.downloadEntries(entries),
    ...options,
  })

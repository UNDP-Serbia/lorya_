import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { OcrMutationKeys } from './ocr.keys'
import {
  ocrEndpoints,
  type OcrProcessRequestDto,
  type OcrProcessingResultDto,
  type RevertRequestDto,
  type RevertResponseDto,
  type SaveWordEditRequestDto,
} from '../../api'

export const useOcrProcess = (
  options: UseMutationOptions<
    OcrProcessingResultDto,
    Error,
    OcrProcessRequestDto & { slug: string }
  > = {}
) => {
  return useMutation<
    OcrProcessingResultDto,
    Error,
    OcrProcessRequestDto & { slug: string }
  >({
    ...options,
    mutationKey: OcrMutationKeys.process,
    mutationFn: async ({ slug, ...payload }) => {
      return await ocrEndpoints.process(slug, payload)
    },
  })
}

export const useRevertOcr = (
  options?: UseMutationOptions<RevertResponseDto, Error, RevertRequestDto>
) =>
  useMutation({
    mutationKey: OcrMutationKeys.revert,
    mutationFn: (data: RevertRequestDto) => ocrEndpoints.revert(data),
    ...options,
  })

export const useOcrSaveWordEdit = (
  options?: UseMutationOptions<
    { success: boolean },
    Error,
    SaveWordEditRequestDto
  >
) =>
  useMutation({
    mutationKey: OcrMutationKeys.saveWordEdit,
    mutationFn: (data: SaveWordEditRequestDto) =>
      ocrEndpoints.saveWordEdit(data),
    ...options,
  })

import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { PostOcrCorrectionMutationKeys } from './post-ocr-correction.keys'
import {
  postOcrCorrectionEndpoints,
  type PostOcrCorrectionProcessingResultDto,
  type RevertRequestDto,
  type RevertResponseDto,
  type SaveWordEditRequestDto,
} from '../../api'

export const usePostOcrCorrectionProcess = (
  options: UseMutationOptions<
    PostOcrCorrectionProcessingResultDto,
    Error,
    { slug: string; inputDir: string; fileName: string; modelRunId?: string }
  > = {}
) => {
  return useMutation<
    PostOcrCorrectionProcessingResultDto,
    Error,
    { slug: string; inputDir: string; fileName: string; modelRunId?: string }
  >({
    ...options,
    mutationKey: PostOcrCorrectionMutationKeys.process,
    mutationFn: async ({ slug, ...payload }) => {
      return await postOcrCorrectionEndpoints.process(slug, payload)
    },
  })
}

export const useRevertPostOcrCorrection = (
  options?: UseMutationOptions<RevertResponseDto, Error, RevertRequestDto>
) =>
  useMutation({
    mutationKey: PostOcrCorrectionMutationKeys.revert,
    mutationFn: (data: RevertRequestDto) =>
      postOcrCorrectionEndpoints.revert(data),
    ...options,
  })

export const usePostOcrSaveWordEdit = (
  options?: UseMutationOptions<
    { success: boolean },
    Error,
    SaveWordEditRequestDto
  >
) =>
  useMutation({
    mutationKey: PostOcrCorrectionMutationKeys.saveWordEdit,
    mutationFn: (data: SaveWordEditRequestDto) =>
      postOcrCorrectionEndpoints.saveWordEdit(data),
    ...options,
  })

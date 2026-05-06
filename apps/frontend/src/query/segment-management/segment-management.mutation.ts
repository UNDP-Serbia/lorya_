import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { SegmentManagementMutationKeys } from './segment-management.keys'
import {
  segmentManagementEndpoints,
  type AdjustSegmentRequest,
  type AdjustSegmentResult,
  type CropSegmentsRequestDto,
  type CropSegmentsResultDto,
  type RevertRequestDto,
  type RevertResponseDto,
  type SegmentModelProcessRequest,
  type SegmentModelProcessResult,
} from '../../api'

export const useCropSegments = (
  options: UseMutationOptions<
    CropSegmentsResultDto,
    Error,
    CropSegmentsRequestDto
  > = {}
) => {
  return useMutation<CropSegmentsResultDto, Error, CropSegmentsRequestDto>({
    ...options,
    mutationKey: SegmentManagementMutationKeys.crop,
    mutationFn: async payload => {
      return await segmentManagementEndpoints.cropSegments(payload)
    },
  })
}

export const useAdjustSegment = (
  options: UseMutationOptions<
    AdjustSegmentResult,
    Error,
    AdjustSegmentRequest
  > = {}
) => {
  return useMutation<AdjustSegmentResult, Error, AdjustSegmentRequest>({
    ...options,
    mutationKey: SegmentManagementMutationKeys.adjust,
    mutationFn: async payload => {
      return await segmentManagementEndpoints.adjustSegment(payload)
    },
  })
}

export const useSegmentModelProcess = (
  options: UseMutationOptions<
    SegmentModelProcessResult,
    Error,
    { slug: string } & SegmentModelProcessRequest
  > = {}
) => {
  return useMutation<
    SegmentModelProcessResult,
    Error,
    { slug: string } & SegmentModelProcessRequest
  >({
    ...options,
    mutationKey: SegmentManagementMutationKeys.processModel,
    mutationFn: async ({ slug, ...payload }) => {
      return await segmentManagementEndpoints.processModel(slug, payload)
    },
  })
}

export const useRevertSegmentation = (
  options?: UseMutationOptions<RevertResponseDto, Error, RevertRequestDto>
) =>
  useMutation({
    mutationKey: SegmentManagementMutationKeys.revertSegmentation,
    mutationFn: (data: RevertRequestDto) =>
      segmentManagementEndpoints.revertSegmentation(data),
    ...options,
  })

export const useRevertSegment = (
  options?: UseMutationOptions<RevertResponseDto, Error, string>
) =>
  useMutation({
    mutationKey: SegmentManagementMutationKeys.revertSegment,
    mutationFn: (segmentId: string) =>
      segmentManagementEndpoints.revertSegment(segmentId),
    ...options,
  })

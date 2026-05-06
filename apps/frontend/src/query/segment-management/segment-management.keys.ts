import { QueryClientKeys } from '../base.keys'

export const SegmentManagementQueryKeys = {
  all: [...QueryClientKeys.all, 'segment-management'] as const,
  segments: (fileId: string) =>
    [...SegmentManagementQueryKeys.all, 'segments', fileId] as const,
}

const ALL = SegmentManagementQueryKeys.all

export const SegmentManagementMutationKeys = {
  crop: [...ALL, 'crop'],
  adjust: [...ALL, 'adjust'],
  processModel: [...ALL, 'process-model'],
  revertSegmentation: [...ALL, 'revert-segmentation'],
  revertSegment: [...ALL, 'revert-segment'],
}

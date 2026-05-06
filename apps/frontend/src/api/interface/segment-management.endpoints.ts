import { restClient } from '../client'
import type {
  AdjustSegmentRequest,
  AdjustSegmentResult,
  CropSegmentsRequestDto,
  CropSegmentsResultDto,
  RevertRequestDto,
  RevertResponseDto,
  SegmentModelProcessRequest,
  SegmentModelProcessResult,
  SegmentResponse,
} from '../types'

const base = '/ai/models/segment-management'

export const segmentManagementEndpoints = {
  cropSegments: async (body: CropSegmentsRequestDto) => {
    const res = await restClient.post<CropSegmentsResultDto>(
      `${base}/crop`,
      body
    )
    return res.data
  },

  adjustSegment: async (body: AdjustSegmentRequest) => {
    const res = await restClient.post<AdjustSegmentResult>(
      `${base}/adjust`,
      body
    )
    return res.data
  },

  processModel: async (slug: string, body: SegmentModelProcessRequest) => {
    const res = await restClient.post<SegmentModelProcessResult>(
      `${base}/${slug}/process`,
      body
    )
    return res.data
  },

  getSegments: async (fileId: string) => {
    const res = await restClient.get<SegmentResponse[]>(
      `${base}/segments/${fileId}`
    )
    return res.data
  },

  revertSegmentation: async (
    body: RevertRequestDto
  ): Promise<RevertResponseDto> => {
    const res = await restClient.post<RevertResponseDto>(`${base}/revert`, body)
    return res.data
  },

  revertSegment: async (segmentId: string): Promise<RevertResponseDto> => {
    const res = await restClient.post<RevertResponseDto>(
      `${base}/segments/${segmentId}/revert`
    )
    return res.data
  },
}

import { AiActivityModelType } from './activity.types'

export type RunHistoryStatus = 'success' | 'failed' | 'pending' | 'warning'

export enum RunHistoryResultStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PARTIAL = 'PARTIAL',
}

export type RunHistorySegmentDto = {
  id: string
  segmentId: number
  segmentLabel: string
  status: RunHistoryStatus
  confidence: number | null
  reportUrl: string | null
}

export type RunHistoryFileDto = {
  id: string
  fileId: string
  fileName: string
  imageLabel: string | null
  fileUrl: string | null
  reportUrl: string | null
  status: RunHistoryStatus
  confidence: number | null
  hasSegments: boolean
  segments?: RunHistorySegmentDto[]
}

export type RunHistoryItemDto = {
  id: string
  runId: number
  selectionCount: number
  selectionLabel: string | null
  modelType: AiActivityModelType
  modelId: string
  modelName: string
  modelExecutionId: string | null
  modelUrl: string | null
  status: RunHistoryStatus
  confidence: number | null
  runBy: string
  startedAt: string
  durationMs: number | null
  files: RunHistoryFileDto[]
}

export type RunHistoryListResponseDto = {
  generatedAt: string
  total: number
  page: number
  limit: number
  items: RunHistoryItemDto[]
}

export type RunHistoryListQueryDto = {
  page?: number
  limit?: number
  modelType?: AiActivityModelType
  modelId?: string
  userId?: string
  directoryId?: string
  resultStatus?: RunHistoryResultStatus
  from?: string
  to?: string
}

export type StartModelRunDto = {
  modelType: AiActivityModelType
  modelId: string
  selectionCount: number
}

export type StartModelRunResponseDto = {
  id: string
  runId: number
}

export type ModelRunCompletedDto = {
  id: string
  executionStatus: 'IN_PROGRESS' | 'SUCCESS' | 'FAILURE'
  resultStatus: RunHistoryResultStatus | null
  aggregateConfidence: number | null
  durationMs: number
}

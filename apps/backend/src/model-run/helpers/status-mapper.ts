import { ActivityStatus } from '../../activity/enums'
import { ModelRunResultStatus } from '../types'
import type { RunHistoryStatus } from '../dto/model-run-segment.dto'

export const mapRunStatusToFrontend = (
  executionStatus: ActivityStatus,
  resultStatus: ModelRunResultStatus | null
): RunHistoryStatus => {
  if (executionStatus === ActivityStatus.IN_PROGRESS) return 'pending'
  if (executionStatus === ActivityStatus.FAILURE) return 'failed'
  // executionStatus === SUCCESS
  if (resultStatus === ModelRunResultStatus.SUCCESS) return 'success'
  if (resultStatus === ModelRunResultStatus.PARTIAL) return 'warning'
  return 'failed' // resultStatus === FAILURE or null fallback
}

export const mapActivityStatusToFrontend = (
  status: ActivityStatus
): RunHistoryStatus => {
  if (status === ActivityStatus.IN_PROGRESS) return 'pending'
  if (status === ActivityStatus.SUCCESS) return 'success'
  return 'failed'
}

export const aggregateChildStatuses = (
  statuses: RunHistoryStatus[]
): RunHistoryStatus => {
  if (statuses.length === 0) return 'failed'
  if (statuses.includes('pending')) return 'pending'
  if (statuses.every(s => s === 'success')) return 'success'
  if (statuses.every(s => s === 'failed')) return 'failed'
  return 'warning'
}

export const aggregateConfidence = (
  values: (number | null)[]
): number | null => {
  const numeric = values.filter((v): v is number => typeof v === 'number')
  if (numeric.length === 0) return null
  const sum = numeric.reduce((a, b) => a + b, 0)
  return Math.round(sum / numeric.length)
}

export const computeResultStatus = (
  childExecutionStatuses: ActivityStatus[]
): ModelRunResultStatus => {
  if (childExecutionStatuses.length === 0) return ModelRunResultStatus.FAILURE
  const allSuccess = childExecutionStatuses.every(
    s => s === ActivityStatus.SUCCESS
  )
  const allFailure = childExecutionStatuses.every(
    s => s === ActivityStatus.FAILURE
  )
  if (allSuccess) return ModelRunResultStatus.SUCCESS
  if (allFailure) return ModelRunResultStatus.FAILURE
  return ModelRunResultStatus.PARTIAL
}

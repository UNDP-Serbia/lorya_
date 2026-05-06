import { ActivityStatus } from '../../activity/enums'
import { ModelRunResultStatus } from '../types'
import {
  aggregateConfidence,
  computeResultStatus,
  mapActivityStatusToFrontend,
  mapRunStatusToFrontend,
} from './status-mapper'

describe('status-mapper', () => {
  describe('mapRunStatusToFrontend', () => {
    it('returns pending when execution IN_PROGRESS', () => {
      expect(mapRunStatusToFrontend(ActivityStatus.IN_PROGRESS, null)).toBe(
        'pending'
      )
    })
    it('returns failed when execution FAILURE', () => {
      expect(mapRunStatusToFrontend(ActivityStatus.FAILURE, null)).toBe(
        'failed'
      )
    })
    it('returns success when SUCCESS + result SUCCESS', () => {
      expect(
        mapRunStatusToFrontend(
          ActivityStatus.SUCCESS,
          ModelRunResultStatus.SUCCESS
        )
      ).toBe('success')
    })
    it('returns warning when SUCCESS + result PARTIAL', () => {
      expect(
        mapRunStatusToFrontend(
          ActivityStatus.SUCCESS,
          ModelRunResultStatus.PARTIAL
        )
      ).toBe('warning')
    })
    it('returns failed when SUCCESS + result FAILURE', () => {
      expect(
        mapRunStatusToFrontend(
          ActivityStatus.SUCCESS,
          ModelRunResultStatus.FAILURE
        )
      ).toBe('failed')
    })
  })

  describe('mapActivityStatusToFrontend', () => {
    it('maps IN_PROGRESS -> pending', () => {
      expect(mapActivityStatusToFrontend(ActivityStatus.IN_PROGRESS)).toBe(
        'pending'
      )
    })
    it('maps SUCCESS -> success', () => {
      expect(mapActivityStatusToFrontend(ActivityStatus.SUCCESS)).toBe(
        'success'
      )
    })
    it('maps FAILURE -> failed', () => {
      expect(mapActivityStatusToFrontend(ActivityStatus.FAILURE)).toBe('failed')
    })
  })

  describe('computeResultStatus', () => {
    it('returns FAILURE when no children', () => {
      expect(computeResultStatus([])).toBe(ModelRunResultStatus.FAILURE)
    })
    it('returns SUCCESS when all children SUCCESS', () => {
      expect(
        computeResultStatus([ActivityStatus.SUCCESS, ActivityStatus.SUCCESS])
      ).toBe(ModelRunResultStatus.SUCCESS)
    })
    it('returns FAILURE when all children FAILURE', () => {
      expect(
        computeResultStatus([ActivityStatus.FAILURE, ActivityStatus.FAILURE])
      ).toBe(ModelRunResultStatus.FAILURE)
    })
    it('returns PARTIAL on mixed', () => {
      expect(
        computeResultStatus([ActivityStatus.SUCCESS, ActivityStatus.FAILURE])
      ).toBe(ModelRunResultStatus.PARTIAL)
    })
  })

  describe('aggregateConfidence', () => {
    it('returns null on empty', () => {
      expect(aggregateConfidence([])).toBeNull()
    })
    it('returns null on all-null', () => {
      expect(aggregateConfidence([null, null])).toBeNull()
    })
    it('ignores nulls in mix', () => {
      expect(aggregateConfidence([90, null, 80])).toBe(85)
    })
    it('rounds to integer', () => {
      expect(aggregateConfidence([90, 91])).toBe(91)
      expect(aggregateConfidence([90, 91, 92])).toBe(91)
      expect(aggregateConfidence([86, 87])).toBe(87) // 86.5 rounds to 87
    })
  })
})

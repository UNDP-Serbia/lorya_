import {
  createMap,
  forMember,
  mapFrom,
  mapWith,
  Mapper,
  MappingProfile,
} from '@automapper/core'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { ActivityEntity } from 'src/activity/activity.entity'
import { OcrResultEntity } from 'src/ocr/ocr-result.entity'
import { PostOcrCorrectionResultEntity } from 'src/post-ocr-correction/post-ocr-correction-result.entity'
import { ModelRunEntity } from 'src/model-run/model-run.entity'
import {
  ModelRunCompletedDto,
  ModelRunFileDto,
  ModelRunListItemDto,
  ModelRunSegmentDto,
  StartModelRunResponseDto,
} from 'src/model-run/dto'
import { mapRunStatusToFrontend } from 'src/model-run/helpers'

type EnrichedModelRun = ModelRunEntity & {
  modelName: string | null
  modelKind: string | null
  activities: EnrichedActivity[]
}

type EnrichedActivity = ActivityEntity & {
  fileName: string
  fileStatus: 'success' | 'failed' | 'pending' | 'warning'
  fileConfidence: number | null
  hasSegments: boolean
}

type EnrichedSegment = (OcrResultEntity | PostOcrCorrectionResultEntity) & {
  segmentNumber: number
  segmentLabel: string
  segmentFrontendStatus: 'success' | 'failed' | 'pending' | 'warning'
  confidencePercent: number | null
}

export class ModelRunProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  get profile(): MappingProfile {
    return mapper => {
      // Lifecycle: start
      createMap(mapper, ModelRunEntity, StartModelRunResponseDto)

      // Lifecycle: complete
      createMap(mapper, ModelRunEntity, ModelRunCompletedDto)

      // List item
      createMap(
        mapper,
        ModelRunEntity,
        ModelRunListItemDto,
        forMember(
          d => d.modelName,
          mapFrom(s => (s as EnrichedModelRun).modelName ?? '')
        ),
        forMember(
          d => d.modelKind,
          mapFrom(s => (s as EnrichedModelRun).modelKind ?? null)
        ),
        forMember(
          d => d.runBy,
          mapFrom(s =>
            s.user ? `${s.user.firstName} ${s.user.lastName}`.trim() : ''
          )
        ),
        forMember(
          d => d.startedAt,
          mapFrom(s => s.startedAt?.toISOString?.() ?? '')
        ),
        forMember(
          d => d.confidence,
          mapFrom(s => s.aggregateConfidence)
        ),
        forMember(
          d => d.durationMs,
          mapFrom(s => s.durationMs)
        ),
        forMember(
          d => d.status,
          mapFrom(s =>
            mapRunStatusToFrontend(s.executionStatus, s.resultStatus)
          )
        ),
        forMember(
          d => d.selectionLabel,
          mapFrom((): null => null)
        ),
        forMember(
          d => d.modelExecutionId,
          mapFrom((): null => null)
        ),
        forMember(
          d => d.modelUrl,
          mapFrom((): null => null)
        ),
        forMember(
          d => d.files,
          mapWith(
            ModelRunFileDto,
            ActivityEntity,
            s => (s as EnrichedModelRun).activities
          )
        )
      )

      // File (per-row inside list item)
      createMap(
        mapper,
        ActivityEntity,
        ModelRunFileDto,
        forMember(
          d => d.fileName,
          mapFrom(s => (s as EnrichedActivity).fileName)
        ),
        forMember(
          d => d.status,
          mapFrom(s => (s as EnrichedActivity).fileStatus)
        ),
        forMember(
          d => d.confidence,
          mapFrom(s => (s as EnrichedActivity).fileConfidence)
        ),
        forMember(
          d => d.hasSegments,
          mapFrom(s => (s as EnrichedActivity).hasSegments)
        ),
        forMember(
          d => d.imageLabel,
          mapFrom((): null => null)
        ),
        forMember(
          d => d.fileUrl,
          mapFrom((): null => null)
        ),
        forMember(
          d => d.reportUrl,
          mapFrom((): null => null)
        )
      )

      // Segment from OCR result
      createMap(
        mapper,
        OcrResultEntity,
        ModelRunSegmentDto,
        forMember(
          d => d.segmentId,
          mapFrom(s => (s as EnrichedSegment).segmentNumber)
        ),
        forMember(
          d => d.segmentLabel,
          mapFrom(s => (s as EnrichedSegment).segmentLabel)
        ),
        forMember(
          d => d.status,
          mapFrom(s => (s as EnrichedSegment).segmentFrontendStatus)
        ),
        forMember(
          d => d.confidence,
          mapFrom(s => (s as EnrichedSegment).confidencePercent)
        ),
        forMember(
          d => d.reportUrl,
          mapFrom((): null => null)
        )
      )

      // Segment from Post-OCR result
      createMap(
        mapper,
        PostOcrCorrectionResultEntity,
        ModelRunSegmentDto,
        forMember(
          d => d.segmentId,
          mapFrom(s => (s as EnrichedSegment).segmentNumber)
        ),
        forMember(
          d => d.segmentLabel,
          mapFrom(s => (s as EnrichedSegment).segmentLabel)
        ),
        forMember(
          d => d.status,
          mapFrom(s => (s as EnrichedSegment).segmentFrontendStatus)
        ),
        forMember(
          d => d.confidence,
          mapFrom(s => (s as EnrichedSegment).confidencePercent)
        ),
        forMember(
          d => d.reportUrl,
          mapFrom((): null => null)
        )
      )
    }
  }
}

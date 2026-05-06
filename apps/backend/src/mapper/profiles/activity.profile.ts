import {
  createMap,
  forMember,
  mapFrom,
  Mapper,
  MappingProfile,
} from '@automapper/core'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { ActivityEntity } from 'src/activity/activity.entity'
import { ActivityDto, ActivityDetailDto } from 'src/activity/dto'

export class ActivityProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(
        mapper,
        ActivityEntity,
        ActivityDto,
        forMember(
          dest => dest.userFullName,
          mapFrom(src =>
            src.user ? `${src.user.firstName} ${src.user.lastName}`.trim() : ''
          )
        ),
        forMember(
          dest => dest.startedAt,
          mapFrom(src => src.startedAt?.toISOString?.() ?? '')
        ),
        forMember(
          dest => dest.finishedAt,
          mapFrom(src => (src.finishedAt ? src.finishedAt.toISOString() : null))
        ),
        forMember(
          dest => dest.modelName,
          mapFrom(
            src =>
              (src as ActivityEntity & { modelName?: string | null })
                .modelName ?? null
          )
        )
      )

      createMap(
        mapper,
        ActivityEntity,
        ActivityDetailDto,
        forMember(
          dest => dest.userFullName,
          mapFrom(src =>
            src.user ? `${src.user.firstName} ${src.user.lastName}`.trim() : ''
          )
        ),
        forMember(
          dest => dest.startedAt,
          mapFrom(src => src.startedAt?.toISOString?.() ?? '')
        ),
        forMember(
          dest => dest.finishedAt,
          mapFrom(src => (src.finishedAt ? src.finishedAt.toISOString() : null))
        ),
        forMember(
          dest => dest.modelName,
          mapFrom(
            src =>
              (src as ActivityEntity & { modelName?: string | null })
                .modelName ?? null
          )
        ),
        forMember(
          dest => dest.metadata,
          mapFrom(src => src.metadata ?? null)
        )
      )
    }
  }
}

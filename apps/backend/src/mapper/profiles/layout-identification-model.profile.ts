import {
  createMap,
  forMember,
  mapFrom,
  Mapper,
  MappingProfile,
} from '@automapper/core'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { LayoutIdentificationModelEntity } from 'src/layout-identification/layout-identification-model.entity'
import { LayoutIdentificationModelDto } from 'src/layout-identification/dto/layout-identification-model.dto'

export class LayoutIdentificationModelProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(
        mapper,
        LayoutIdentificationModelEntity,
        LayoutIdentificationModelDto,
        forMember(
          dest => dest.description,
          mapFrom(src => src.description ?? null)
        ),
        forMember(
          dest => dest.reference,
          mapFrom(src => src.reference ?? null)
        ),
        forMember(
          dest => dest.configFilePath,
          mapFrom(src => src.configFilePath ?? null)
        ),
        forMember(
          dest => dest.inputMapperFilePath,
          mapFrom(src => src.inputMapperFilePath ?? null)
        ),
        forMember(
          dest => dest.outputMapperFilePath,
          mapFrom(src => src.outputMapperFilePath ?? null)
        )
      )
    }
  }
}

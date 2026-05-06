import { Injectable } from '@nestjs/common'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import {
  createMap,
  forMember,
  mapFrom,
  Mapper,
  MappingProfile,
  mapWithArguments,
} from '@automapper/core'
import { AccountEntity } from '../../account/entities'
import { AccountDto } from '../../account/dto'
import { CreateAccountDto } from '../../account/dto/create-account.dto'
import { UpdateAccountDto } from '../../account/dto/update-account.dto'

@Injectable()
export class AccountProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(
        mapper,
        AccountEntity,
        AccountDto,
        forMember(
          dest => dest.fullName,
          mapFrom(src => `${src.firstName} ${src.lastName}`)
        )
      )
      createMap(mapper, CreateAccountDto, AccountEntity)
      createMap(
        mapper,
        UpdateAccountDto,
        AccountEntity,
        forMember(
          dest => dest.id,
          mapWithArguments((_source, { id }) => id)
        ),
        forMember(
          dest => dest.firstName,
          mapFrom(src => src.firstName)
        ),
        forMember(
          dest => dest.lastName,
          mapFrom(src => src.lastName)
        ),
        forMember(
          dest => dest.email,
          mapFrom(src => src.email)
        ),
        forMember(
          dest => dest.role,
          mapFrom(src => src.role)
        )
      )
    }
  }
}

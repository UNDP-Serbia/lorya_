import { SetMetadata } from '@nestjs/common'
import { Role } from '../../account/types'
import { MetadataType } from '../types'

export const Roles = (...roles: Role[]) =>
  SetMetadata(MetadataType.ROLES, roles)

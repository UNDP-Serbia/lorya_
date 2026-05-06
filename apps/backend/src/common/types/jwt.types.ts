import { Role } from '../../account/types'

export type JwtPayload = {
  sub: string
  role: Role
}

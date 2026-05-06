import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from '../../account/types'
import { MetadataType } from '../../common/types'

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles: Role[] = this.reflector.getAllAndOverride<Role[]>(
      MetadataType.ROLES,
      [context.getHandler(), context.getClass()]
    )

    if (!requiredRoles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    const hasRole: boolean = requiredRoles.some(role => user.role === role)

    if (!hasRole) {
      throw new ForbiddenException('Access denied.')
    }

    return hasRole
  }
}

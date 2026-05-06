import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { MetadataType } from '../../common/types'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthenticationGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    super()
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()

    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(
      MetadataType.IS_PUBLIC,
      [context.getHandler(), context.getClass()]
    )

    if (isPublic) {
      return true
    }

    const token = request.headers.Authorization?.split(' ')?.[1]
    if (token) {
      try {
        const user = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get('JWT_SECRET'),
          ignoreExpiration: false,
          algorithms: ['HS256'],
        })

        if (user) {
          request.user = user
        }
      } catch {
        return response.status(403).json({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Invalid access token.',
        })
      }
    }

    return super.canActivate(context)
  }
}

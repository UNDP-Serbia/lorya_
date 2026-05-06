import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { JwtPayload } from '../types'

export const Payload = createParamDecorator(
  (_data: JwtPayload, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest()
    return user
  }
)

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class ExtractAccessTokenMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}
  async use(req: Request, _res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')?.[1]
    if (!token) {
      return next(new BadRequestException('Access token is required.'))
    }
    try {
      req.user = await this.jwtService.verifyAsync(token, {
        ignoreExpiration: true,
      })
    } catch {
      return next(new ForbiddenException('Invalid access token.'))
    }
    next()
  }
}

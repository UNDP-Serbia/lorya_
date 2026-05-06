import { registerAs } from '@nestjs/config'
import { Config } from '../types'
import { JwtModuleOptions } from '@nestjs/jwt'
import './../options/dotenv.config'

export const JwtConfig = registerAs(
  Config.JWT,
  (): JwtModuleOptions => ({
    secretOrPrivateKey: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: `${Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN)}`,
      algorithm: 'HS256',
    },
    verifyOptions: {
      algorithms: ['HS256'],
      ignoreExpiration: false,
    },
  })
)

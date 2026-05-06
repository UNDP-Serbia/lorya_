import { registerAs } from '@nestjs/config'

import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { Config } from '../types'

export const CorsConfig = registerAs(
  Config.CORS,
  (): CorsOptions => ({
    origin: '*',
    methods: 'GET,POST,PUT,PATCH,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
)

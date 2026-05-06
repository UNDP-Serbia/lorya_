import { RouteTree } from '@nestjs/core'
import { AuthModule } from './auth.module'

export const authRoutes: RouteTree = {
  path: 'auth',
  module: AuthModule,
}

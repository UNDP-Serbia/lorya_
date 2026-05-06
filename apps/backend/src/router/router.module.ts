import { Module } from '@nestjs/common'
import { RouterModule as NestRouterModule } from '@nestjs/core'
import { routes } from './router.routes'

@Module({
  imports: [
    NestRouterModule.register([
      {
        path: '/api/v1',
        children: routes,
      },
    ]),
  ],
})
export class RouterModule {}

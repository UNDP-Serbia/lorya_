import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { AccountModule } from '../account/account.module'
import { CommonModule } from '../common/common.module'
import { ExtractAccessTokenMiddleware } from './middleware/extract-access-token.middleware'

@Module({
  imports: [AccountModule, CommonModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ExtractAccessTokenMiddleware)
      .forRoutes({ path: '/api/*/auth/refresh', method: RequestMethod.ALL })
  }
}

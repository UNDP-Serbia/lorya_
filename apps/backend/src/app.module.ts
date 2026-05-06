import { Module } from '@nestjs/common'
import { ConfigModule } from './config/config.module'
import { CoreModule } from './core/core.module'

@Module({
  imports: [ConfigModule, CoreModule],
})
export class AppModule {}

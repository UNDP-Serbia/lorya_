import { Module } from '@nestjs/common'
import { AccountModule } from '../account/account.module'
import { AuthModule } from '../auth/auth.module'
import { FileManagerModule } from '../file-manager/file-manager.module'
import { AiModule } from 'src/ai/ai.module'
import { ActivityModule } from 'src/activity/activity.module'
import { ModelRunModule } from 'src/model-run/model-run.module'

@Module({
  imports: [
    AuthModule,
    AccountModule,
    FileManagerModule,
    AiModule,
    ActivityModule,
    ModelRunModule,
  ],
})
export class CoreModule {}

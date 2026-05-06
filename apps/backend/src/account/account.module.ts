import { Module } from '@nestjs/common'
import { AccountService } from './account.service'
import { AccountController } from './account.controller'
import { AccountRepository } from './account.repository'
import { DatabaseModule } from '../database/database.module'
import { AccountEntity } from './entities'
import { CommonModule } from '../common/common.module'

@Module({
  imports: [DatabaseModule.forFeature([AccountEntity]), CommonModule],
  controllers: [AccountController],
  providers: [AccountService, AccountRepository],
  exports: [AccountService],
})
export class AccountModule {}

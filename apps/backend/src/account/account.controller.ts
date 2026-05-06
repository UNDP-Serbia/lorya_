import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common'
import { AccountService } from './account.service'
import { AccountEntity } from './entities'
import { AccountDto } from './dto'
import { InjectMapper } from '@automapper/nestjs'
import { Mapper } from '@automapper/core'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Payload, Roles } from '../common/decorators'
import { Role } from './types'
import { CreateAccountDto } from './dto/create-account.dto'
import { UpdateAccountDto } from './dto/update-account.dto'
import { JwtPayload } from '../common/types'

@Controller()
@ApiBearerAuth('bearerToken')
@ApiTags('Accounts')
@Roles(Role.ADMIN)
export class AccountController {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly accountService: AccountService
  ) {}

  @ApiOperation({ summary: 'Get all accounts' })
  @ApiOkResponse({
    description: 'Account',
    type: () => AccountDto,
    isArray: true,
  })
  @ApiBearerAuth('bearerToken')
  @Get()
  async getAccounts(@Payload() payload: JwtPayload) {
    const accounts = await this.accountService.getAccounts(payload.sub)
    return await this.mapper.mapArrayAsync<AccountEntity, AccountDto>(
      accounts,
      AccountEntity,
      AccountDto
    )
  }

  @ApiOperation({ summary: 'Get account' })
  @ApiOkResponse({
    description: 'Account',
    type: () => AccountDto,
  })
  @ApiBearerAuth('bearerToken')
  @Get(':id')
  async getAccount(@Param('id', ParseUUIDPipe) id: string) {
    const account = await this.accountService.getAccount({ id })
    return await this.mapper.mapAsync<AccountEntity, AccountDto>(
      account,
      AccountEntity,
      AccountDto
    )
  }

  @ApiOperation({ summary: 'Create account' })
  @ApiCreatedResponse({
    description: 'Account',
    type: () => AccountDto,
  })
  @ApiBearerAuth('bearerToken')
  @Post()
  async createAccount(@Body() body: CreateAccountDto): Promise<AccountDto> {
    const account = await this.accountService.createAccount(body)
    return await this.mapper.mapAsync<AccountEntity, AccountDto>(
      account,
      AccountEntity,
      AccountDto
    )
  }

  @ApiOperation({ summary: 'Delete account' })
  @ApiOkResponse({
    description: 'Account',
    type: () => AccountDto,
  })
  @ApiBearerAuth('bearerToken')
  @Put(':id')
  async updateAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAccountDto
  ) {
    const account = await this.accountService.updateAccount(id, body)
    return await this.mapper.mapAsync<AccountEntity, AccountDto>(
      account,
      AccountEntity,
      AccountDto
    )
  }

  @ApiOperation({ summary: 'Delete account' })
  @ApiOkResponse({
    description: 'Account',
    type: () => AccountDto,
  })
  @ApiBearerAuth('bearerToken')
  @Delete(':id')
  async deleteAccount(@Param('id', ParseUUIDPipe) id: string) {
    const account = await this.accountService.deleteAccount(id)
    return await this.mapper.mapAsync<AccountEntity, AccountDto>(
      account,
      AccountEntity,
      AccountDto
    )
  }
}

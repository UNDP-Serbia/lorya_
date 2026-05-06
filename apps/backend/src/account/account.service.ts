import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { AccountRepository } from './account.repository'
import { CreateAccountDto } from './dto/create-account.dto'
import { InjectMapper } from '@automapper/nestjs'
import { Mapper } from '@automapper/core'
import { AccountEntity } from './entities'
import { HashService } from '../common/services'
import { UpdateAccountDto } from './dto/update-account.dto'

@Injectable()
export class AccountService {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly accountRepository: AccountRepository,
    private readonly hashService: HashService
  ) {}

  getAccounts(id: string) {
    return this.accountRepository.findAll(id)
  }

  async getAccount(params: { id?: string; email?: string }) {
    const account = await this.accountRepository.findOne({
      id: params.id,
      email: params.email,
    })
    if (!account) {
      throw new NotFoundException('Account not found')
    }
    return account
  }

  async createAccount(body: CreateAccountDto) {
    const existingAccount = await this.accountRepository.findOne({
      email: body.email,
    })
    if (existingAccount) {
      throw new BadRequestException('Account already exists')
    }
    const entity = await this.mapper.mapAsync(
      body,
      CreateAccountDto,
      AccountEntity
    )
    entity.password = await this.hashService.hashPassword(body.password)
    return await this.accountRepository.create(entity)
  }

  async updateAccount(id: string, body: UpdateAccountDto) {
    const account = await this.accountRepository.findOne({
      id,
    })
    if (!account) {
      throw new NotFoundException('Account not found')
    }

    if (
      body.email &&
      account.email.toLowerCase() !== body.email.toLowerCase()
    ) {
      const existingAccount = await this.accountRepository.findOne({
        email: body.email,
      })
      if (existingAccount) {
        throw new BadRequestException('Account already exists')
      }
    }

    const entity = await this.mapper.mapAsync(
      body,
      UpdateAccountDto,
      AccountEntity,
      {
        extraArgs: () => ({
          id,
        }),
      }
    )
    if (body.password) {
      entity.password = await this.hashService.hashPassword(body.password)
    }

    const updatedAccount = await this.accountRepository.save(entity)
    updatedAccount.firstName = updatedAccount.firstName || account.firstName
    updatedAccount.lastName = updatedAccount.lastName || account.lastName
    updatedAccount.email = updatedAccount.email || account.email
    updatedAccount.role = updatedAccount.role || account.role

    return updatedAccount
  }

  async deleteAccount(id: string) {
    const account = await this.accountRepository.findOne({
      id,
    })
    if (!account) {
      throw new NotFoundException('Account not found')
    }
    await this.accountRepository.delete(id)
    return account
  }
}

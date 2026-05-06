import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AccountEntity } from './entities'
import { Not, Repository } from 'typeorm'

@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly repository: Repository<AccountEntity>
  ) {}

  findAll(id: string) {
    return this.repository.find({
      where: {
        id: Not(id),
      },
    })
  }

  findOne(params: { id?: string; email?: string }) {
    return this.repository.findOne({
      where: params,
    })
  }

  create(account: AccountEntity) {
    return this.repository.save(account)
  }

  save(account: Partial<AccountEntity>) {
    return this.repository.save(account, { reload: true })
  }

  delete(id: string) {
    return this.repository.delete({
      id,
    })
  }
}

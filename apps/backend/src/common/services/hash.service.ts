import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

@Injectable()
export class HashService {
  private readonly saltOrRounds: number = 10

  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltOrRounds)
  }

  comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
}

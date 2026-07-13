import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
} from './dto'
import { AccountService } from '../account/account.service'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from '../common/types'
import { HashService } from '../common/services'
import { ConfigService } from '@nestjs/config'
import { CreateAccountDto } from '../account/dto/create-account.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly configService: ConfigService
  ) {}

  async login(data: LoginRequestDto) {
    const account = await this.accountService.getAccount({ email: data.email })
    if (!account) {
      throw new NotFoundException('Account not found.')
    }
    const compareResult = await this.hashService.comparePassword(
      data.password,
      account.password
    )
    if (!compareResult) {
      throw new BadRequestException('Password not match')
    }
    const payload: JwtPayload = { sub: account.id, role: account.role }
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    })
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      {
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
      }
    )
    return new LoginResponseDto(accessToken, refreshToken)
  }

  async register(data: CreateAccountDto) {
    return this.accountService.createAccount(data)
  }

  async getMe(payload: JwtPayload) {
    return this.accountService.getAccount({ id: payload.sub })
  }

  async refreshToken(data: RefreshTokenRequestDto, payload: JwtPayload) {
    try {
      const refreshTokenPayload = await this.jwtService.verifyAsync(
        data.refreshToken
      )
      if (
        refreshTokenPayload.type !== 'refresh' ||
        refreshTokenPayload.sub !== payload.sub
      ) {
        throw new Error('Invalid refresh token.')
      }
      const account = await this.accountService.getAccount({ id: payload?.sub })
      if (!account) {
        throw new NotFoundException('Account not found.')
      }
      const accessTokenPayload: JwtPayload = {
        sub: account.id,
        role: account.role,
      }
      const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
      })
      const refreshToken = await this.jwtService.signAsync(
        { ...accessTokenPayload, type: 'refresh' },
        {
          expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
        }
      )
      return new LoginResponseDto(accessToken, refreshToken)
    } catch {
      throw new ForbiddenException('Invalid refresh token.')
    }
  }
}

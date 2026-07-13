import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginRequestDto, LoginResponseDto } from './dto'
import { InjectMapper } from '@automapper/nestjs'
import { Mapper } from '@automapper/core'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Payload, Public } from '../common/decorators'
import { CreateAccountDto } from '../account/dto/create-account.dto'
import { AccountDto } from '../account/dto'
import { AccountEntity } from '../account/entities'
import { RefreshTokenRequestDto } from './dto/refresh-token-request.dto'
import { JwtPayload } from '../common/types'

@Controller()
@ApiTags('Auth')
export class AuthController {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly authService: AuthService
  ) {}

  @ApiOperation({ summary: 'Login' })
  @ApiBody({
    type: () => LoginRequestDto,
    description: 'Login request data',
  })
  @ApiOkResponse({
    description: 'Login response',
    type: () => LoginResponseDto,
  })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginRequestDto) {
    return this.authService.login(body)
  }

  @ApiOperation({ summary: 'Register' })
  @ApiBody({
    type: () => CreateAccountDto,
    description: 'Registration data',
  })
  @ApiOkResponse({
    description: 'Account',
    type: () => AccountDto,
  })
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() body: CreateAccountDto) {
    const account = await this.authService.register(body)
    return this.mapper.mapAsync<AccountEntity, AccountDto>(
      account,
      AccountEntity,
      AccountDto
    )
  }

  @ApiOperation({ summary: 'Refresh token' })
  @ApiBody({
    type: () => RefreshTokenRequestDto,
    description: 'Refresh token request data',
  })
  @ApiOkResponse({
    description: 'Refresh token response',
    type: () => LoginResponseDto,
  })
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() body: RefreshTokenRequestDto,
    @Payload() payload: JwtPayload
  ) {
    return this.authService.refreshToken(body, payload)
  }

  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({
    description: 'Current user account',
    type: () => AccountDto,
  })
  @ApiBearerAuth('bearerToken')
  @Get('me')
  async getMe(@Payload() payload: JwtPayload) {
    const account = await this.authService.getMe(payload)
    return this.mapper.mapAsync<AccountEntity, AccountDto>(
      account,
      AccountEntity,
      AccountDto
    )
  }
}

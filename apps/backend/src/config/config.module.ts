import { ClassSerializerInterceptor, Global, Module } from '@nestjs/common'
import { ConfigService, ConfigModule as NestConfigModule } from '@nestjs/config'
import { AutomapperConfig } from './options/automapper.config'
import { CorsConfig } from './options/cors.config'
import { DatabaseConfig } from './options/database.config'
import { JwtConfig } from './options/jwt.config'
import { environmentValidator } from './validator/environment.validator'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ValidationPipe } from './pipes'
import { ValidationErrorFilter, JwtErrorFilter } from './filters'
import { AuthorizationGuard, AuthenticationGuard } from './guards'
import { DatabaseModule } from '../database/database.module'
import { RouterModule } from '../router/router.module'
import { MapperModule } from '../mapper/mapper.module'
import { Config } from './types'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './strategies'
import { ServeStaticModule } from '@nestjs/serve-static'
import { CommonModule } from 'src/common/common.module'
import path from 'path'

const ENVIRONMENT = process.env.ENVIRONMENT || 'local'

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [AutomapperConfig, CorsConfig, DatabaseConfig, JwtConfig],
      envFilePath: `.env.${ENVIRONMENT}`,
      validate: environmentValidator,
      ignoreEnvFile: false,
    }),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) =>
        configService.get(Config.JWT),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRootAsync({
      useFactory: (rootPath, segmentsPath) => {
        return [
          {
            rootPath,
            serveRoot: '/storage',
            serveStaticOptions: { index: false },
          },
          {
            rootPath: path.join(process.cwd(), 'public'),
            serveRoot: '/public',
            serveStaticOptions: { index: false },
          },
          {
            rootPath: segmentsPath,
            serveRoot: '/segments',
            serveStaticOptions: { index: false },
          },
        ]
      },
      inject: ['ROOT_PATH', 'SEGMENTS_PATH'],
      imports: [CommonModule],
    }),
    DatabaseModule,
    MapperModule,
    RouterModule,
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationErrorFilter,
    },
    {
      provide: APP_FILTER,
      useClass: JwtErrorFilter,
    },
  ],
  exports: [JwtModule],
})
export class ConfigModule {}

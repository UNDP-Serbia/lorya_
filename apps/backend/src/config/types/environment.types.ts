import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'
import { Type } from 'class-transformer'

export enum Environment {
  LOCAL = 'local',
  DEV = 'dev',
  STAGING = 'staging',
  PROD = 'prod',
}

export class EnvironmentVariables {
  @IsOptional()
  @IsEnum(Environment, {
    message: args => `ENVIRONMENT value ${args.value} is not valid`,
  })
  ENVIRONMENT?: Environment

  @IsNumber()
  @Type(() => Number)
  PORT: number

  @IsNotEmpty()
  @IsString()
  DATABASE_HOST: string

  @IsNumber()
  @Type(() => Number)
  DATABASE_PORT: number

  @IsNotEmpty()
  @IsString()
  DATABASE_USERNAME: string

  @IsNotEmpty()
  @IsString()
  DATABASE_PASSWORD: string

  @IsNotEmpty()
  @IsString()
  DATABASE_NAME: string

  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string

  @IsNotEmpty()
  @IsString()
  CONDA_ENV: string
}

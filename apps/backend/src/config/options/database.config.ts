import { registerAs } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { DataSourceOptions } from 'typeorm'
import { Config } from '../types'
import './../options/dotenv.config'

// When running under Jest (e.g. e2e tests via ts-jest), TypeORM must register
// the same entity class instances that the application code imports from src/.
// Loading from dist/*.js would register a different set of class objects and
// cause "No metadata for ..." errors at runtime.
const isJest = !!process.env.JEST_WORKER_ID
const entitiesGlob = isJest
  ? ['src/**/*.entity.ts']
  : ['dist/**/*.entity.{ts,js}']
const subscribersGlob = isJest
  ? ['src/**/*.subscriber.ts']
  : ['dist/**/*.subscriber.{ts,js}']
const migrationsGlob = isJest
  ? ['src/database/migrations/*.ts']
  : ['dist/database/migrations/*.{ts,js}']

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: entitiesGlob,
  subscribers: subscribersGlob,
  migrationsTableName: 'migrations',
  migrations: migrationsGlob,
  migrationsRun: !isJest,
  synchronize: false,
  logging: false,
  cache: true,
}

export const DatabaseConfig = registerAs(
  Config.DATABASE,
  (): TypeOrmModuleOptions => {
    return {
      ...dataSourceOptions,
      autoLoadEntities: false,
    }
  }
)

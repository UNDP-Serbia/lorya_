import { DynamicModule, Global, Module } from '@nestjs/common'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { Config } from '../config/types'
import { DataSource, DataSourceOptions } from 'typeorm'
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type'

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService): TypeOrmModuleOptions =>
        config.get(Config.DATABASE) || {},
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {
  static forFeature(
    entities?: EntityClassOrSchema[],
    dataSource?: DataSource | DataSourceOptions | string
  ): DynamicModule {
    return TypeOrmModule.forFeature(entities, dataSource)
  }
}

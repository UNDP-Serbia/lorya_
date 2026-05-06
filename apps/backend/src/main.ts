import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConsoleLogger, Logger } from '@nestjs/common'
import { Config } from './config/types'
import { swaggerConfig } from './config/options/swagger.config'
import helmet from 'helmet'
import { ConfigService } from '@nestjs/config'
import './config/options/dotenv.config'
import { useContainer } from 'class-validator'

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: new ConsoleLogger({
      prefix: 'Lorya API',
    }),
  })

  app.use(helmet({ crossOriginResourcePolicy: false }))
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  swaggerConfig(app)

  const config = app.get(ConfigService)
  app.enableCors(config.get(Config.CORS))

  await app.listen(config.get('PORT') ?? 3000)
  Logger.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()

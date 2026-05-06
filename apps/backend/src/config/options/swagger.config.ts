import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'

export const swaggerConfig = (app: INestApplication) => {
  const configSwagger = new DocumentBuilder()
    .setTitle('Lorya')
    .setDescription('Lorya API documentation')
    .setVersion('1.0')
    .setLicense('MIT', '#')
    .addBearerAuth(
      {
        type: 'http',
        description: 'Enter JWT token to authorize yourself.',
      },
      'bearerToken'
    )
    .build()

  const document = SwaggerModule.createDocument(app, configSwagger)
  SwaggerModule.setup('swagger', app, document)
}

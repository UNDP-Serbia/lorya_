import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { JsonWebTokenError } from '@nestjs/jwt'

@Catch(JsonWebTokenError)
export class JwtErrorFilter implements ExceptionFilter<JsonWebTokenError> {
  catch(exception: JsonWebTokenError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()

    response.status(403).json({
      statusCode: 403,
      error: 'Forbidden',
      message: exception.message,
    })
  }
}

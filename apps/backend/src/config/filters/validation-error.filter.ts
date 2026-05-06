import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { ValidationError } from 'class-validator'

@Catch(ValidationError)
export class ValidationErrorFilter implements ExceptionFilter<ValidationError> {
  catch(exception: ValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()

    response.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message: Object.values(exception.constraints || {})[0],
    })
  }
}

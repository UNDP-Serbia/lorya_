import {
  BadRequestException,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common'
import { ValidationError } from 'class-validator'

export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      stopAtFirstError: true,
      validationError: {
        target: false,
        value: false,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const message = errors
          .map(this.extractAllContraints)
          .flat()
          .flatMap(e => Object.values(e))[0]
        return new BadRequestException(message)
      },
    })
  }

  extractAllContraints = (error: ValidationError): Record<string, string>[] => {
    if (error.children?.length) {
      return error.children.flatMap(this.extractAllContraints)
    }
    return [error.constraints || {}]
  }
}

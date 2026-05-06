import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@Injectable()
@ValidatorConstraint({ name: 'IsFile', async: false })
export class IsFileConstraint implements ValidatorConstraintInterface {
  constructor() {}

  validate(value: Express.Multer.File, args: ValidationArguments) {
    const [options] = args.constraints
    const mimetypes = options?.mime ?? []
    if (
      !mimetypes.length ||
      (value?.mimetype && (options?.mime ?? []).includes(value?.mimetype))
    ) {
      return true
    }
    return false
  }

  defaultMessage(_args: ValidationArguments) {
    return 'File is not valid'
  }
}

type IsFileOptions = {
  mime?: ('application/pdf' | 'image/jpg' | 'image/png' | 'image/jpeg')[]
}
export function IsFile(
  options: IsFileOptions,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsFile',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsFileConstraint,
      constraints: [options],
    })
  }
}

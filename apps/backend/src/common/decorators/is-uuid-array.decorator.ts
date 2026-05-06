import {
  isUUID,
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: false })
export class IsUuidArrayConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return (
      typeof value === 'string' &&
      value
        .split(',')
        .map(item => isUUID(item))
        .every(item => !!item)
    )
  }

  defaultMessage() {
    return 'UUID array is not valid.'
  }
}

export function IsUuidArray(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string | symbol) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName.toString(),
      options: validationOptions,
      constraints: [],
      validator: IsUuidArrayConstraint,
    })
  }
}

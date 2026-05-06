import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { DirectoryEntryType } from 'src/file-manager/types'
import { PathService } from '../services/path.service'
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
@ValidatorConstraint({ name: 'IsPath', async: false })
export class IsPathConstraint implements ValidatorConstraintInterface {
  constructor(
    @Inject('ROOT_PATH_SERVICE') private readonly pathService: PathService
  ) {}

  validate(value: string, args: ValidationArguments) {
    const [options] = args.constraints
    const type = options?.type || DirectoryEntryType.DIRECTORY
    return this.pathService.isPathExists(value, type)
  }

  defaultMessage(args: ValidationArguments) {
    const [options] = args.constraints
    const type = options?.type || DirectoryEntryType.DIRECTORY
    if (type === DirectoryEntryType.FILE) {
      return 'Path must be a valid file'
    } else if (type === DirectoryEntryType.DIRECTORY) {
      return 'Path must be a valid directory'
    }
    return 'Path must be valid'
  }
}

interface IsPathOptions {
  type?: DirectoryEntryType
}

export function IsPath(
  options?: IsPathOptions,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsPath',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsPathConstraint,
      constraints: [options],
    })
  }
}

import { PipeTransform, BadRequestException } from '@nestjs/common'

export class ParseEnumPipe implements PipeTransform {
  constructor(private readonly enumType: object) {}

  transform(value: unknown) {
    if (typeof value !== 'string') {
      throw new BadRequestException('Value must be a string')
    }

    const enumValues = Object.values(this.enumType)
    if (!enumValues.includes(value)) {
      throw new BadRequestException(
        `Invalid value: ${value}. Must be one of ${enumValues.join(', ')}`
      )
    }

    return value
  }
}

import { plainToInstance } from 'class-transformer'
import { EnvironmentVariables } from '../types'
import { validateSync } from 'class-validator'

export const environmentValidator = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  })

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment variables:\n${errors.map(error => `${error.property}: ${Object.values(error.constraints || {}).join(', ')}.`).join('\n')}`
    )
  }
  return validatedConfig
}

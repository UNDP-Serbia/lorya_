import { registerAs } from '@nestjs/config'
import { CreateMapperOptions } from '@automapper/core'
import { classes } from '@automapper/classes'
import { Config } from '../types'

export const AutomapperConfig = registerAs(
  Config.AUTOMAPPER,
  (): CreateMapperOptions => ({
    strategyInitializer: classes(),
  })
)

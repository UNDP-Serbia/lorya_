import { defineConfig } from 'eslint/config'
import esLintConfig from '@shared/config/eslint/react/eslint.config.js'
import pluginQuery from '@tanstack/eslint-plugin-query'

export default defineConfig([
  esLintConfig,
  ...pluginQuery.configs['flat/recommended'],
])

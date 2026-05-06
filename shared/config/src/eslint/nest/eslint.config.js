import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import esLintConfig from '../base/eslint.config.js'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,ts}'],
    extends: [esLintConfig],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      'no-empty': 'off',
    },
  },
])

import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import tseslint from 'typescript-eslint'
import unusedImports from 'eslint-plugin-unused-imports'

export default defineConfig([
  globalIgnores(['dist', 'eslint.config.js']),
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          caughtErrorsIgnorePattern: '^_',
          args: 'all',
        },
      ],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'all',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
])

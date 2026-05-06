import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import esLintConfig from '../base/eslint.config.js';
import reactPlugin from 'eslint-plugin-react'

export default defineConfig([
  globalIgnores(['dist']),
  reactHooks.configs['recommended-latest'],
  reactRefresh.configs.vite,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      esLintConfig,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react: reactPlugin,
    },
    rules: {
      'react-refresh/only-export-components': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typecript-eslint/no-unsafe-member-access': 'off',
      '@typecript-eslint/no-unsafe-call': 'off',
      '@typecript-eslint/no-unsafe-assignment': 'off',
    }
  },
])

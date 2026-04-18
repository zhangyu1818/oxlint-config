import type { Rules } from '../../types.ts'

export const importRules: Rules = {
  'import/first': 'error',
  'import/no-duplicates': ['error', { 'prefer-inline': true }],
  'import/no-mutable-exports': 'error',
  'import/no-named-default': 'error',
  'import/no-self-import': 'error',
  'import/no-webpack-loader-syntax': 'error',
}

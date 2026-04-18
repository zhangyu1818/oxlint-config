import type { Rules } from '../../types.ts'

export const nodeRules: Rules = {
  'node/handle-callback-err': ['error', '^(err|error)$'],
  'node/no-exports-assign': 'error',
  'node/no-new-require': 'error',
  'node/no-path-concat': 'error',
}

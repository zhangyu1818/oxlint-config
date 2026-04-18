import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import type { OxlintJsPlugin, Rules } from '../../types.ts'

function resolveReactAgentRulesPluginPath(): OxlintJsPlugin {
  const sourcePluginPath = fileURLToPath(
    new URL('../../react-agent-rules.ts', import.meta.url),
  )

  if (existsSync(sourcePluginPath)) {
    return sourcePluginPath
  }

  return fileURLToPath(new URL('./react-agent-rules.js', import.meta.url))
}

export const reactAgentRulesPlugin = resolveReactAgentRulesPluginPath()

export const reactAgentRules: Rules = {
  'react-agent-rules/effect-empty-deps-only': 'error',
  'react-agent-rules/no-forward-ref': 'error',
  'react-agent-rules/no-manual-memoization': 'error',
}

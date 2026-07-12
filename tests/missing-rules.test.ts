import { execFile } from 'node:child_process'
import { join } from 'node:path'
import { promisify } from 'node:util'

import { describe, expect, it } from 'vitest'

import { defineConfig } from '../src/index'

const execFileAsync = promisify(execFile)

const missingNativeRules = [
  'one-var',
  'no-restricted-syntax',
  'node/hashbang',
  'node/no-deprecated-api',
  'node/prefer-global/buffer',
  'node/prefer-global/process',
  'node/process-exit-as-throw',
  'react/no-deprecated',
  'react/function-component-definition',
] as const

function resolveOxlintBinary() {
  return join(process.cwd(), 'node_modules/.bin/oxlint')
}

describe('native rule availability', () => {
  it('does not export migration report from runtime api', async () => {
    const exports = await import('../src/index')

    expect(exports).not.toHaveProperty('droppedRuleCount')
    expect(exports).not.toHaveProperty('droppedRulesByReason')
  })

  it('keeps the manually remapped native rule enabled', () => {
    const config = defineConfig({
      presets: {
        ignores: false,
        next: false,
        node: false,
        react: false,
        test: false,
        typescript: true,
      },
    })

    const typeScriptOverride = config.overrides?.find((override) =>
      override.files.includes('**/*.ts'),
    )

    expect(
      Object.keys(typeScriptOverride?.rules ?? {}).some((rule) =>
        rule.includes('no-implied-eval'),
      ),
    ).toBe(true)
  })

  it('verifies the remaining missing rules are absent from current oxlint', async () => {
    const { stdout } = await execFileAsync(
      resolveOxlintBinary(),
      ['--rules', '--format=json'],
      {
        cwd: process.cwd(),
        maxBuffer: 30 * 1024 * 1024,
      },
    )
    const registered = JSON.parse(stdout) as { scope: string; value: string }[]
    const available = new Set(
      registered.map((entry) =>
        entry.scope === 'eslint'
          ? entry.value
          : `${entry.scope.replace(/_/g, '-')}/${entry.value}`,
      ),
    )

    for (const rule of missingNativeRules) {
      const candidate = rule.replace('@typescript-eslint/', 'typescript/')
      expect(available.has(rule) || available.has(candidate)).toBe(false)
    }
  })
})

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { describe, expect, it } from 'vitest'

import { defineConfig } from '../src/index'

const execFileAsync = promisify(execFile)

const missingNativeRules = [
  'import/newline-after-import',
  'prefer-regex-literals',
  'no-unreachable-loop',
  'one-var',
  'no-restricted-properties',
  'no-restricted-syntax',
  'node/hashbang',
  'node/no-deprecated-api',
  'node/prefer-global/buffer',
  'node/prefer-global/process',
  'node/process-exit-as-throw',
  '@typescript-eslint/explicit-member-accessibility',
  '@typescript-eslint/method-signature-style',
  'jsx-a11y/interactive-supports-focus',
  'jsx-a11y/no-interactive-element-to-noninteractive-role',
  'jsx-a11y/no-noninteractive-element-interactions',
  'jsx-a11y/no-noninteractive-element-to-interactive-role',
  'react/no-deprecated',
  'react/no-unstable-nested-components',
  'react/function-component-definition',
] as const

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
      'pnpm',
      ['exec', 'oxlint', '--rules'],
      {
        cwd: process.cwd(),
      },
    )

    for (const rule of missingNativeRules) {
      const candidate = rule.replace('@typescript-eslint/', 'typescript/')
      expect(stdout.includes(rule) || stdout.includes(candidate)).toBe(false)
    }
  })
})

import { describe, expect, it } from 'vitest'

import {
  defaultIgnorePatterns,
  defaultOxlintPresets,
  defaultSortImports,
  defineConfig,
  defineOxfmtConfig,
} from '../src/index'

function getPluginSpecifier(plugin: unknown) {
  if (typeof plugin === 'string') {
    return plugin
  }

  if (
    plugin
    && typeof plugin === 'object'
    && 'specifier' in plugin
    && typeof plugin.specifier === 'string'
  ) {
    return plugin.specifier
  }

  return undefined
}

describe('exports', () => {
  it('builds an oxlint config with bundled presets', () => {
    const config = defineConfig({
      presets: {
        next: true,
        node: true,
        reactAgentRules: true,
        react: {
          options: {
            a11y: false,
            framework: {
              next: true,
              vite: false,
            },
          },
        },
        test: true,
        typescript: true,
      },
    })

    expect(config.plugins).toEqual(
      expect.arrayContaining(['import', 'node', 'typescript', 'unicorn']),
    )
    const pluginSpecifier = getPluginSpecifier(config.jsPlugins?.[0])

    expect(pluginSpecifier).toContain('react-agent-rules')
    expect(pluginSpecifier).not.toBe(
      '@zhangyu1818/oxlint-config/react-agent-rules',
    )
    expect(config.options?.typeAware).toBe(true)
    expect(config.rules).toMatchObject({
      'react-agent-rules/effect-empty-deps-only': 'error',
      'react-agent-rules/no-forward-ref': 'error',
      'react-agent-rules/no-manual-memoization': 'error',
    })
    expect(config.rules).not.toHaveProperty('no-restricted-imports')

    const reactOverride = config.overrides?.find((override) =>
      override.plugins?.includes('react'),
    )

    expect(reactOverride?.plugins).not.toContain('jsx-a11y')
    expect(reactOverride?.rules).toHaveProperty('react/exhaustive-deps', 'off')
    expect(reactOverride?.rules).toHaveProperty('nextjs/no-img-element', 'warn')
    expect(reactOverride?.rules).toHaveProperty('react/only-export-components')
  })

  it('matches the react default enablement for react-agent-rules', () => {
    const config = defineConfig()
    const pluginSpecifier = getPluginSpecifier(config.jsPlugins?.[0])
    const hasPlugin = Boolean(pluginSpecifier?.includes('react-agent-rules'))
    const hasRules = [
      'react-agent-rules/effect-empty-deps-only',
      'react-agent-rules/no-forward-ref',
      'react-agent-rules/no-manual-memoization',
    ].every((rule) => config.rules?.[rule] === 'error')

    expect(defaultOxlintPresets.reactAgentRules).toBe(defaultOxlintPresets.react)
    expect(Boolean(hasPlugin)).toBe(defaultOxlintPresets.reactAgentRules)
    expect(Boolean(hasRules)).toBe(defaultOxlintPresets.reactAgentRules)
  })

  it('builds an oxfmt config with native sorters', () => {
    const config = defineOxfmtConfig({
      presets: {
        imports: true,
        packageJson: true,
        tailwindcss: {
          options: {
            functions: ['tw'],
          },
        },
      },
    })

    expect(config.sortImports).toMatchObject(defaultSortImports)
    expect(config.sortPackageJson).toEqual({ sortScripts: false })
    expect(config.sortTailwindcss).toEqual({ functions: ['tw'] })
    expect(config.ignorePatterns).toEqual(
      expect.arrayContaining(defaultIgnorePatterns),
    )
  })
})

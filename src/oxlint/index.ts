import { isPackageExists } from 'local-pkg'

import { defaultIgnorePatterns } from '../shared/ignore-patterns.ts'
import { importRules } from './presets/imports.ts'
import { javascriptRules } from './presets/javascript.ts'
import { nextjsRules } from './presets/next.ts'
import { nodeRules } from './presets/node.ts'
import { createReactRules, jsxA11yRules } from './presets/react.ts'
import { vitestRules } from './presets/test.ts'
import { typeScriptRules } from './presets/typescript.ts'
import { unicornRules } from './presets/unicorn.ts'
import {
  appendPlugin,
  dtsFiles,
  dedupe,
  jsRequireFiles,
  mergeRules,
  pruneOverride,
  resolveIgnorePreset,
  resolveRulePreset,
  scriptFiles,
  sourceFiles,
  testFiles,
  tsFiles,
} from './shared.ts'

import type {
  DefineOxlintConfigOptions,
  OxlintConfig,
  OxlintOverride,
  OxlintPlugin,
  OxlintPresets,
  TypeScriptOptions,
} from '../types.ts'

export const defaultOxlintPresets = {
  ignores: true,
  imports: true,
  javascript: true,
  next: isPackageExists('next'),
  node: false,
  react: isPackageExists('react'),
  test: isPackageExists('vitest'),
  typescript: isPackageExists('typescript'),
  unicorn: true,
} satisfies Required<OxlintPresets>

export function defineOxlintConfig(
  options: DefineOxlintConfigOptions = {},
): OxlintConfig {
  const presets = {
    ...defaultOxlintPresets,
    ...options.presets,
  }

  const ignorePreset = resolveIgnorePreset(presets.ignores, true)
  const importPreset = resolveRulePreset(presets.imports, true)
  const javascriptPreset = resolveRulePreset(presets.javascript, true)
  const nextPreset = resolveRulePreset(presets.next, defaultOxlintPresets.next)
  const nodePreset = resolveRulePreset(presets.node, false)
  const reactPreset = resolveRulePreset(
    presets.react,
    defaultOxlintPresets.react,
  )
  const testPreset = resolveRulePreset(presets.test, defaultOxlintPresets.test)
  const typeScriptPreset = resolveRulePreset<TypeScriptOptions>(
    presets.typescript,
    defaultOxlintPresets.typescript,
  )
  const unicornPreset = resolveRulePreset(presets.unicorn, true)

  const plugins: OxlintPlugin[] = []
  const rules = mergeRules(
    unicornPreset.enabled ? unicornRules : undefined,
    unicornPreset.rules,
    importPreset.enabled ? importRules : undefined,
    importPreset.rules,
    javascriptPreset.enabled ? javascriptRules : undefined,
    javascriptPreset.rules,
    nodePreset.enabled ? nodeRules : undefined,
    nodePreset.rules,
    options.rules,
  )

  if (unicornPreset.enabled) {
    appendPlugin(plugins, 'unicorn')
  }
  if (importPreset.enabled) {
    appendPlugin(plugins, 'import')
  }
  if (typeScriptPreset.enabled) {
    appendPlugin(plugins, 'typescript')
  }
  if (nodePreset.enabled) {
    appendPlugin(plugins, 'node')
  }

  const overrides: OxlintOverride[] = []

  if (javascriptPreset.enabled) {
    overrides.push({
      files: scriptFiles,
      rules: {
        'no-console': 'off',
      },
    })
  }

  if (typeScriptPreset.enabled) {
    overrides.push({
      files: tsFiles,
      rules: mergeRules(typeScriptRules, typeScriptPreset.rules),
    })
    overrides.push({
      files: dtsFiles,
      rules: {
        'import/no-duplicates': 'off',
      },
    })
    overrides.push({
      files: jsRequireFiles,
      rules: {
        'typescript/no-require-imports': 'off',
        'typescript/no-var-requires': 'off',
      },
    })
  }

  if (reactPreset.enabled || nextPreset.enabled) {
    const reactOptions = reactPreset.options ?? {}
    const a11y = reactOptions.a11y ?? true
    const overridePlugins: OxlintPlugin[] = []
    const reactRules = reactPreset.enabled
      ? createReactRules(reactOptions, nextPreset.enabled)
      : {}
    const nextRules = nextPreset.enabled ? nextjsRules : {}
    const mergedRules = mergeRules(
      reactRules,
      a11y && reactPreset.enabled ? jsxA11yRules : undefined,
      nextRules,
      reactPreset.rules,
      nextPreset.rules,
    )

    if (reactPreset.enabled) {
      appendPlugin(overridePlugins, 'react')
    }
    if (reactPreset.enabled && a11y) {
      appendPlugin(overridePlugins, 'jsx-a11y')
    }
    if (nextPreset.enabled) {
      appendPlugin(overridePlugins, 'nextjs')
    }

    const override = pruneOverride({
      files: sourceFiles,
      plugins: overridePlugins,
      rules: mergedRules,
    })

    if (override) {
      overrides.push(override)
    }
  }

  if (testPreset.enabled) {
    overrides.push({
      files: testFiles,
      plugins: ['vitest'],
      rules: mergeRules(vitestRules, testPreset.rules),
    })
  }

  const config: OxlintConfig = {
    $schema: './node_modules/oxlint/configuration_schema.json',
    categories: {
      correctness: 'off',
      ...(options.categories ?? {}),
    },
    env: {
      browser: true,
      builtin: true,
      es2024: true,
      node: true,
      ...(options.env ?? {}),
    },
    ignorePatterns: ignorePreset.enabled
      ? dedupe([
          ...defaultIgnorePatterns,
          ...ignorePreset.patterns,
          ...(options.ignorePatterns ?? []),
        ])
      : options.ignorePatterns,
    overrides: [...overrides, ...(options.overrides ?? [])]
      .map(pruneOverride)
      .filter((override): override is OxlintOverride => override !== null),
    plugins,
    rules,
    settings: options.settings,
  }

  if (typeScriptPreset.enabled) {
    config.options = {
      typeAware: typeScriptPreset.options?.typeAware ?? true,
    }
  }

  if (!config.ignorePatterns || config.ignorePatterns.length === 0) {
    delete config.ignorePatterns
  }
  if (!config.overrides || config.overrides.length === 0) {
    delete config.overrides
  }
  if (!config.plugins || config.plugins.length === 0) {
    delete config.plugins
  }
  if (!config.rules || Object.keys(config.rules).length === 0) {
    delete config.rules
  }
  if (!config.settings || Object.keys(config.settings).length === 0) {
    delete config.settings
  }

  return config
}

export const defineConfig = defineOxlintConfig

export { defaultIgnorePatterns }

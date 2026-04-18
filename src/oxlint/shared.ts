import { dedupe, resolvePreset } from '../shared/utils.ts'

import type {
  IgnorePresetConfig,
  OxlintOverride,
  OxlintPlugin,
  Rules,
} from '../types.ts'

export const scriptFiles = [
  'scripts/**/*.js',
  'scripts/**/*.mjs',
  'scripts/**/*.cjs',
  'scripts/**/*.jsx',
  'scripts/**/*.ts',
  'scripts/**/*.mts',
  'scripts/**/*.cts',
  'scripts/**/*.tsx',
  'cli.js',
  'cli.mjs',
  'cli.cjs',
  'cli.jsx',
  'cli.ts',
  'cli.mts',
  'cli.cts',
  'cli.tsx',
]

export const tsFiles = [
  '**/*.ts',
  '**/*.mts',
  '**/*.cts',
  '**/*.tsx',
  '**/*.mtsx',
  '**/*.ctsx',
]

export const sourceFiles = [
  '**/*.js',
  '**/*.mjs',
  '**/*.cjs',
  '**/*.jsx',
  '**/*.ts',
  '**/*.mts',
  '**/*.cts',
  '**/*.tsx',
  '**/*.mtsx',
  '**/*.ctsx',
]

export const dtsFiles = ['**/*.d.ts', '**/*.d.mts', '**/*.d.cts']

export const jsRequireFiles = ['**/*.js', '**/*.cjs']

export const testFiles = [
  '**/__tests__/**/*.js',
  '**/__tests__/**/*.mjs',
  '**/__tests__/**/*.cjs',
  '**/__tests__/**/*.jsx',
  '**/__tests__/**/*.ts',
  '**/__tests__/**/*.mts',
  '**/__tests__/**/*.cts',
  '**/__tests__/**/*.tsx',
  '**/__tests__/**/*.mtsx',
  '**/__tests__/**/*.ctsx',
  '**/*.spec.js',
  '**/*.spec.mjs',
  '**/*.spec.cjs',
  '**/*.spec.jsx',
  '**/*.spec.ts',
  '**/*.spec.mts',
  '**/*.spec.cts',
  '**/*.spec.tsx',
  '**/*.spec.mtsx',
  '**/*.spec.ctsx',
  '**/*.test.js',
  '**/*.test.mjs',
  '**/*.test.cjs',
  '**/*.test.jsx',
  '**/*.test.ts',
  '**/*.test.mts',
  '**/*.test.cts',
  '**/*.test.tsx',
  '**/*.test.mtsx',
  '**/*.test.ctsx',
  '**/*.bench.js',
  '**/*.bench.mjs',
  '**/*.bench.cjs',
  '**/*.bench.jsx',
  '**/*.bench.ts',
  '**/*.bench.mts',
  '**/*.bench.cts',
  '**/*.bench.tsx',
  '**/*.bench.mtsx',
  '**/*.bench.ctsx',
  '**/*.benchmark.js',
  '**/*.benchmark.mjs',
  '**/*.benchmark.cjs',
  '**/*.benchmark.jsx',
  '**/*.benchmark.ts',
  '**/*.benchmark.mts',
  '**/*.benchmark.cts',
  '**/*.benchmark.tsx',
  '**/*.benchmark.mtsx',
  '**/*.benchmark.ctsx',
]

export function resolveRulePreset<TOptions>(
  preset:
    | boolean
    | {
        enabled?: boolean
        options?: TOptions
        rules?: Rules
      }
    | undefined,
  defaultEnabled: boolean,
) {
  const resolved = resolvePreset(preset, defaultEnabled)

  return {
    ...resolved,
    rules:
      typeof preset === 'boolean' || preset == null
        ? ({} as Rules)
        : (preset.rules ?? {}),
  }
}

export function resolveIgnorePreset(
  preset: boolean | IgnorePresetConfig | undefined,
  defaultEnabled: boolean,
) {
  if (typeof preset === 'boolean' || preset == null) {
    return {
      enabled: preset ?? defaultEnabled,
      patterns: [] as string[],
    }
  }

  return {
    enabled: preset.enabled ?? defaultEnabled,
    patterns: preset.patterns ?? [],
  }
}

export function mergeRules(...entries: (Rules | undefined)[]) {
  return Object.assign({}, ...entries)
}

export function appendPlugin(plugins: OxlintPlugin[], plugin: OxlintPlugin) {
  if (!plugins.includes(plugin)) {
    plugins.push(plugin)
  }
}

export { dedupe }

export function pruneOverride(override: OxlintOverride): OxlintOverride | null {
  const result: OxlintOverride = {
    files: override.files,
  }

  if (override.env && Object.keys(override.env).length !== 0) {
    result.env = override.env
  }

  if (override.plugins && override.plugins.length !== 0) {
    result.plugins = override.plugins
  }

  if (override.rules && Object.keys(override.rules).length !== 0) {
    result.rules = override.rules
  }

  return result.rules || result.plugins || result.env ? result : null
}

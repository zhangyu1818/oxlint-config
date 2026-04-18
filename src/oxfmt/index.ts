import { defaultIgnorePatterns } from '../shared/ignore-patterns.ts'
import { dedupe, resolvePreset } from '../shared/utils.ts'
import { defaultSortImports } from './presets/imports.ts'
import { defaultSortPackageJson } from './presets/package-json.ts'
import { defaultTailwindSort } from './presets/tailwindcss.ts'

import type {
  DefineOxfmtConfigOptions,
  OxfmtConfig,
  OxfmtPresets,
  SortPackageJsonOptions,
} from '../types.ts'

export const defaultOxfmtPresets: Required<OxfmtPresets> = {
  imports: true,
  packageJson: true,
  tailwindcss: false,
}

export function defineOxfmtConfig(
  options: DefineOxfmtConfigOptions = {},
): OxfmtConfig {
  const presets = {
    ...defaultOxfmtPresets,
    ...options.presets,
  }

  const importsPreset = resolvePreset(presets.imports, true)
  const packageJsonPreset = resolvePreset(presets.packageJson, true)
  const tailwindPreset = resolvePreset(presets.tailwindcss, false)

  const sortImports = importsPreset.enabled
    ? {
        ...defaultSortImports,
        ...importsPreset.options,
      }
    : false

  const sortPackageJson: boolean | SortPackageJsonOptions =
    packageJsonPreset.enabled
      ? {
          ...defaultSortPackageJson,
          ...packageJsonPreset.options,
        }
      : false

  const sortTailwindcss = tailwindPreset.enabled
    ? {
        ...defaultTailwindSort,
        ...tailwindPreset.options,
      }
    : false

  return {
    $schema: './node_modules/oxfmt/configuration_schema.json',
    endOfLine: options.endOfLine ?? 'lf',
    ignorePatterns: dedupe([
      ...defaultIgnorePatterns,
      ...(options.ignorePatterns ?? []),
    ]),
    overrides: options.overrides,
    printWidth: options.printWidth ?? 80,
    semi: options.semi ?? false,
    singleQuote: options.singleQuote ?? true,
    sortImports,
    sortPackageJson,
    sortTailwindcss,
    tabWidth: options.tabWidth ?? 2,
    trailingComma: options.trailingComma ?? 'all',
    useTabs: options.useTabs ?? false,
  }
}

export { defaultSortImports }

export type Severity = 'off' | 'warn' | 'error'

export type JsonPrimitive = boolean | null | number | string
export type JsonValue = JsonObject | JsonPrimitive | JsonValue[]

export interface JsonObject {
  [key: string]: JsonValue
}

export type RuleConfig = Severity | [Severity, ...JsonValue[]]
export type Rules = Record<string, RuleConfig>
export interface OxlintJsPluginAlias {
  name: string
  specifier: string
}

export type OxlintJsPlugin = OxlintJsPluginAlias | string

export type OxlintPlugin =
  | 'eslint'
  | 'import'
  | 'jest'
  | 'jsdoc'
  | 'jsx-a11y'
  | 'nextjs'
  | 'node'
  | 'oxc'
  | 'promise'
  | 'react'
  | 'react-perf'
  | 'typescript'
  | 'unicorn'
  | 'vitest'
  | 'vue'

export interface OxlintOverride {
  env?: Record<string, boolean>
  files: string[]
  jsPlugins?: OxlintJsPlugin[]
  plugins?: OxlintPlugin[]
  rules?: Rules
}

export interface OxlintConfig {
  $schema?: string
  categories?: Record<string, Severity>
  env?: Record<string, boolean>
  ignorePatterns?: string[]
  jsPlugins?: OxlintJsPlugin[]
  options?: {
    typeAware?: boolean
    typeCheck?: boolean
  }
  overrides?: OxlintOverride[]
  plugins?: OxlintPlugin[]
  rules?: Rules
  settings?: Record<string, JsonValue>
}

export interface OxlintPresetConfig<TOptions = undefined> {
  enabled?: boolean
  options?: TOptions
  rules?: Rules
}

export interface IgnorePresetConfig {
  enabled?: boolean
  patterns?: string[]
}

export interface ReactOptions {
  next?: boolean
  vite?: boolean
}

export interface ReactPresetOptions {
  a11y?: boolean
  framework?: ReactOptions
}

export interface TypeScriptOptions {
  typeAware?: boolean
}

export interface OxlintPresets {
  ignores?: boolean | IgnorePresetConfig
  imports?: boolean | OxlintPresetConfig
  javascript?: boolean | OxlintPresetConfig
  next?: boolean | OxlintPresetConfig
  node?: boolean | OxlintPresetConfig
  react?: boolean | OxlintPresetConfig<ReactPresetOptions>
  reactAgentRules?: boolean | OxlintPresetConfig
  test?: boolean | OxlintPresetConfig
  typescript?: boolean | OxlintPresetConfig<TypeScriptOptions>
  unicorn?: boolean | OxlintPresetConfig
}

export interface DefineOxlintConfigOptions {
  categories?: Record<string, Severity>
  env?: Record<string, boolean>
  ignorePatterns?: string[]
  jsPlugins?: OxlintJsPlugin[]
  overrides?: OxlintOverride[]
  presets?: OxlintPresets
  rules?: Rules
  settings?: Record<string, JsonValue>
}

export interface SortImportCustomGroup {
  elementNamePattern?: string[]
  groupName: string
  modifiers?: string[]
  selector?: string
}

export type SortImportGroup = { newlinesBetween: boolean } | string | string[]

export interface SortImportsOptions {
  customGroups?: SortImportCustomGroup[]
  groups?: SortImportGroup[]
  ignoreCase?: boolean
  internalPattern?: string[]
  newlinesBetween?: boolean
  order?: 'asc' | 'desc'
  partitionByComment?: boolean
  partitionByNewline?: boolean
  sortSideEffects?: boolean
}

export interface SortPackageJsonOptions {
  sortScripts?: boolean
}

export interface TailwindSortOptions {
  attributes?: string[]
  config?: string
  functions?: string[]
  preserveDuplicates?: boolean
  preserveWhitespace?: boolean
  stylesheet?: string
}

export interface OxfmtOverrideOptions {
  endOfLine?: 'cr' | 'crlf' | 'lf'
  printWidth?: number
  semi?: boolean
  singleQuote?: boolean
  sortImports?: boolean | SortImportsOptions
  sortPackageJson?: boolean | SortPackageJsonOptions
  sortTailwindcss?: boolean | TailwindSortOptions
  tabWidth?: number
  trailingComma?: 'all' | 'es5' | 'none'
  useTabs?: boolean
}

export interface OxfmtOverride {
  excludeFiles?: string[]
  files: string[]
  options: OxfmtOverrideOptions
}

export interface OxfmtConfig extends OxfmtOverrideOptions {
  $schema?: string
  ignorePatterns?: string[]
  overrides?: OxfmtOverride[]
}

export interface OxfmtPresetConfig<TOptions = undefined> {
  enabled?: boolean
  options?: TOptions
}

export interface OxfmtPresets {
  imports?: boolean | OxfmtPresetConfig<SortImportsOptions>
  packageJson?: boolean | OxfmtPresetConfig<SortPackageJsonOptions>
  tailwindcss?: boolean | OxfmtPresetConfig<TailwindSortOptions>
}

export interface DefineOxfmtConfigOptions extends OxfmtOverrideOptions {
  ignorePatterns?: string[]
  overrides?: OxfmtOverride[]
  presets?: OxfmtPresets
}

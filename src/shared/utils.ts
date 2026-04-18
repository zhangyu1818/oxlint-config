export interface TogglePresetConfig<TOptions = undefined> {
  enabled?: boolean
  options?: TOptions
}

export function resolvePreset<TOptions>(
  preset: boolean | TogglePresetConfig<TOptions> | undefined,
  defaultEnabled: boolean,
) {
  if (typeof preset === 'boolean' || preset == null) {
    return {
      enabled: preset ?? defaultEnabled,
      options: undefined as TOptions | undefined,
    }
  }

  return {
    enabled: preset.enabled ?? true,
    options: preset.options,
  }
}

export function dedupe(values: string[]) {
  return [...new Set(values)]
}

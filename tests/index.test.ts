import { describe, expect, it } from 'vitest'

import {
  defaultIgnorePatterns,
  defaultSortImports,
  defineConfig,
  defineOxfmtConfig,
} from '../src/index'

describe('exports', () => {
  it('builds an oxlint config with native presets only', () => {
    const config = defineConfig({
      presets: {
        next: true,
        node: true,
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
    expect(config.options?.typeAware).toBe(true)

    const reactOverride = config.overrides?.find((override) =>
      override.plugins?.includes('react'),
    )

    expect(reactOverride?.plugins).not.toContain('jsx-a11y')
    expect(reactOverride?.rules).toHaveProperty('nextjs/no-img-element', 'warn')
    expect(reactOverride?.rules).toHaveProperty('react/only-export-components')
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

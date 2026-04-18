# @zhangyu1818/oxlint-config

Native `oxlint` + `oxfmt` presets for JavaScript and TypeScript projects.

This package only uses functionality that is implemented natively in Oxc. It does not rely on ESLint JS plugins.

## Installation

```bash
pnpm add -D @zhangyu1818/oxlint-config oxlint oxlint-tsgolint oxfmt
```

## Oxlint

Create `oxlint.config.ts`:

```ts
import { defineConfig } from '@zhangyu1818/oxlint-config'

export default defineConfig({
  presets: {
    node: true,
    react: true,
    test: true,
    typescript: true,
  },
})
```

Available presets:

- `ignores`
- `imports`
- `javascript`
- `node`
- `react`
- `next`
- `test`
- `typescript`
- `unicorn`

`react` preset options:

```ts
react: {
  options: {
    a11y: true,
    framework: {
      next: true,
      vite: false,
    },
  },
}
```

## Oxfmt

Create `oxfmt.config.ts`:

```ts
import { defineOxfmtConfig } from '@zhangyu1818/oxlint-config'

export default defineOxfmtConfig({
  presets: {
    imports: true,
    packageJson: true,
    tailwindcss: false,
  },
})
```

Default formatter options:

- `semi: false`
- `singleQuote: true`
- `tabWidth: 2`
- `useTabs: false`
- `printWidth: 80`
- `endOfLine: 'lf'`

## Scripts

```json
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "oxfmt -c oxfmt.config.ts .",
    "format:check": "oxfmt --check -c oxfmt.config.ts ."
  }
}
```

## Migration Notes

This migration keeps `264` native rules and drops `139` rules from the previous ESLint-based package.

## Exports

- `defineConfig`
- `defineOxlintConfig`
- `defineOxfmtConfig`
- `defaultIgnorePatterns`
- `defaultSortImports`

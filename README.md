# @zhangyu1818/oxlint-config

Native `oxlint` + `oxfmt` presets for JavaScript and TypeScript projects.

Core presets in this package use functionality implemented natively in Oxc. The `reactAgentRules` preset is backed by an Oxlint JS plugin that ships with this package and auto-enables when `react` is installed.

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
- `reactAgentRules`
- `next`
- `test`
- `typescript`
- `unicorn`

Default line limits:

- source files: `300`
- component files (`*.jsx`, `*.tsx`, `*.mtsx`, `*.ctsx`): `200`
- test files: `500`

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

`reactAgentRules` adds the bundled `react-agent-rules` JS plugin preset and applies:

- `react-agent-rules/no-manual-memoization`
- `react-agent-rules/no-forward-ref`
- `react-agent-rules/effect-empty-deps-only`

```ts
export default defineConfig({
  presets: {
    react: true,
  },
})
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

---
name: setup-oxlint
description: Use when setting up native Oxc linting and formatting in a JS/TS project, migrating from ESLint/Prettier, or standardizing a codebase on @zhangyu1818/oxlint-config.
---

# Setup Oxlint

## Scope

- Confirm the project and CI can satisfy Node.js `^20.19.0 || ^22.13.0 || >=24`
- Ensure `@zhangyu1818/oxlint-config`, `oxlint`, and `oxfmt` are in devDependencies
- Ensure `oxlint-tsgolint` is installed when `typescript` is present
- Create or update `oxlint.config.*` using `defineConfig`
- Create or update `oxfmt.config.*` using `defineOxfmtConfig`
- Derive presets from project dependencies and structure
- Add lint and format scripts when missing

## Workflow

1. Inspect project state (`package.json`, lockfiles, Node version, existing lint and format configs)
2. Confirm Node.js compatibility with `^20.19.0 || ^22.13.0 || >=24`; if not, stop and report the blocker
3. Install or upgrade dependencies:
   - `@zhangyu1818/oxlint-config`
   - `oxlint`
   - `oxfmt`
   - `oxlint-tsgolint` when `typescript` is used
4. Create or update `oxlint.config.*`
5. Create or update `oxfmt.config.*`
6. Configure presets based on the detected stack
7. Add scripts if missing
8. Verify if requested

## Inspect project

- Read `package.json`
- Detect package manager via lockfiles (`pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`, `package-lock.json`)
- Check the active Node.js version and `package.json.engines.node`
- Check for existing config files:
  - `oxlint.config.js`, `oxlint.config.mjs`, `oxlint.config.cjs`, `oxlint.config.ts`
  - `oxfmt.config.js`, `oxfmt.config.mjs`, `oxfmt.config.cjs`, `oxfmt.config.ts`
  - legacy `eslint.config.*`, `.eslintrc.*`, `.prettierrc*`

## Install dependencies

- Use the detected package manager
- Install:
  - pnpm: `pnpm add -D @zhangyu1818/oxlint-config oxlint oxfmt`
  - npm: `npm install -D @zhangyu1818/oxlint-config oxlint oxfmt`
  - yarn: `yarn add -D @zhangyu1818/oxlint-config oxlint oxfmt`
  - bun: `bun add -D @zhangyu1818/oxlint-config oxlint oxfmt`
- If `typescript` is present, also install `oxlint-tsgolint`

## Configure Oxlint

- Prefer an existing `oxlint.config.*` extension; otherwise create `oxlint.config.ts`
- Use ESM import and `defineConfig`

Example base:

```ts
import { defineConfig } from '@zhangyu1818/oxlint-config'

export default defineConfig({
  presets: {},
})
```

## Configure Oxfmt

- Prefer an existing `oxfmt.config.*` extension; otherwise create `oxfmt.config.ts`
- Use ESM import and `defineOxfmtConfig`

Example base:

```ts
import { defineOxfmtConfig } from '@zhangyu1818/oxlint-config'

export default defineOxfmtConfig({
  presets: {},
})
```

## Preset selection

- Enable `next` if `next` is present
- Enable `react` if `react` or `react-dom` is present
- Enable `typescript` if `typescript` is present
- Enable `test` if `vitest` is present
- Enable `node` for backend or CLI projects
- Enable Oxfmt `tailwindcss` sorting if Tailwind class sorting is needed
- Enable Oxfmt `packageJson` sorting if `package.json` ordering should be normalized

## Optional scripts

- Add scripts if missing:

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

## Verify

- Prefer existing project scripts if present
- Otherwise run:
  - `pnpm exec oxlint`
  - `pnpm exec oxfmt --check -c oxfmt.config.ts .`

import { execFile } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import { defineConfig, defineOxfmtConfig } from '../src/index'

const execFileAsync = promisify(execFile)
const tempDirs: string[] = []

interface LintFixtureSuite {
  config: object
  mode: 'lint' | 'format'
  name: string
  valid: string[]
  invalid: string[]
}

async function createTempConfig(filename: string, config: object) {
  const directory = await mkdtemp(join(tmpdir(), 'oxlint-config-'))
  const filepath = join(directory, filename)
  tempDirs.push(directory)

  await writeFile(filepath, JSON.stringify(config, null, 2))
  return filepath
}

async function listFixtures(directory: string) {
  const entries = await readdir(directory)
  return entries
    .filter(
      (entry) => !entry.endsWith('.errors.json') && !entry.startsWith('_'),
    )
    .sort()
}

function matchesRule(output: string, ruleId: string) {
  const shortRule = ruleId.split('/').at(-1)
  return output.includes(ruleId) || output.includes(`(${shortRule})`)
}

async function expectLintPass(configFile: string, filepath: string) {
  await execFileAsync('pnpm', ['exec', 'oxlint', '-c', configFile, filepath], {
    cwd: process.cwd(),
  })
}

async function expectLintFailure(configFile: string, filepath: string) {
  try {
    await expectLintPass(configFile, filepath)
    throw new Error(`Expected lint failure for ${filepath}`)
  } catch (error) {
    return error as Error & { code?: number; stderr?: string; stdout?: string }
  }
}

async function expectFormatPass(configFile: string, filepath: string) {
  await execFileAsync(
    'pnpm',
    ['exec', 'oxfmt', '--check', '-c', configFile, filepath],
    { cwd: process.cwd() },
  )
}

async function expectFormatFailure(configFile: string, filepath: string) {
  try {
    await expectFormatPass(configFile, filepath)
    throw new Error(`Expected format failure for ${filepath}`)
  } catch (error) {
    return error as Error & { code?: number; stderr?: string; stdout?: string }
  }
}

async function expectLintDiagnostics(configFile: string, filepath: string) {
  const errorsFile = `${filepath}.errors.json`
  const expected = JSON.parse(await readFile(errorsFile, 'utf8')) as {
    ruleId?: string
  }[]
  const failure = await expectLintFailure(configFile, filepath)
  const output = `${failure.stdout ?? ''}${failure.stderr ?? ''}${failure.message}`

  for (const error of expected) {
    const ruleId = error.ruleId ?? ''
    expect(matchesRule(output, ruleId)).toBe(true)
  }
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((directory) =>
      rm(directory, {
        force: true,
        recursive: true,
      }),
    ),
  )
})

const lintSuites: LintFixtureSuite[] = [
  {
    name: 'javascript',
    mode: 'lint',
    config: defineConfig({
      presets: {
        ignores: false,
        imports: false,
        next: false,
        node: false,
        react: false,
        test: false,
        typescript: false,
        unicorn: false,
      },
    }),
    valid: ['tests/fixtures/valid/javascript'],
    invalid: ['tests/fixtures/invalid/javascript'],
  },
  {
    name: 'imports',
    mode: 'lint',
    config: defineConfig({
      presets: {
        ignores: false,
        javascript: false,
        next: false,
        node: false,
        react: false,
        test: false,
        typescript: false,
        unicorn: false,
      },
    }),
    valid: ['tests/fixtures/valid/imports'],
    invalid: ['tests/fixtures/invalid/imports'],
  },
  {
    name: 'node',
    mode: 'lint',
    config: defineConfig({
      presets: {
        ignores: false,
        imports: false,
        javascript: false,
        next: false,
        node: true,
        react: false,
        test: false,
        typescript: false,
        unicorn: false,
      },
    }),
    valid: ['tests/fixtures/valid/node'],
    invalid: ['tests/fixtures/invalid/node'],
  },
  {
    name: 'typescript',
    mode: 'lint',
    config: defineConfig({
      presets: {
        ignores: false,
        imports: false,
        javascript: false,
        next: false,
        node: false,
        react: false,
        test: false,
        typescript: true,
        unicorn: false,
      },
    }),
    valid: ['tests/fixtures/valid/typescript'],
    invalid: ['tests/fixtures/invalid/typescript'],
  },
  {
    name: 'react',
    mode: 'lint',
    config: defineConfig({
      presets: {
        ignores: false,
        imports: false,
        javascript: false,
        next: false,
        node: false,
        react: true,
        test: false,
        typescript: false,
        unicorn: false,
      },
    }),
    valid: ['tests/fixtures/valid/react'],
    invalid: ['tests/fixtures/invalid/react'],
  },
  {
    name: 'next',
    mode: 'lint',
    config: defineConfig({
      presets: {
        ignores: false,
        imports: false,
        javascript: false,
        next: true,
        node: false,
        react: false,
        test: false,
        typescript: false,
        unicorn: false,
      },
    }),
    valid: ['tests/fixtures/valid/next'],
    invalid: ['tests/fixtures/invalid/next'],
  },
  {
    name: 'test',
    mode: 'lint',
    config: defineConfig({
      presets: {
        ignores: false,
        imports: false,
        javascript: false,
        next: false,
        node: false,
        react: false,
        test: true,
        typescript: false,
        unicorn: false,
      },
    }),
    valid: ['tests/fixtures/valid/test'],
    invalid: ['tests/fixtures/invalid/test'],
  },
  {
    name: 'unicorn',
    mode: 'lint',
    config: defineConfig({
      presets: {
        ignores: false,
        imports: false,
        javascript: false,
        next: false,
        node: false,
        react: false,
        test: false,
        typescript: false,
        unicorn: true,
      },
    }),
    valid: ['tests/fixtures/valid/unicorn'],
    invalid: ['tests/fixtures/invalid/unicorn'],
  },
  {
    name: 'format',
    mode: 'format',
    config: defineOxfmtConfig({
      ignorePatterns: [],
      presets: {
        imports: false,
        packageJson: false,
        tailwindcss: false,
      },
    }),
    valid: ['tests/fixtures/valid/prettier'],
    invalid: ['tests/fixtures/invalid/prettier'],
  },
  {
    name: 'sort-imports',
    mode: 'format',
    config: defineOxfmtConfig({
      ignorePatterns: [],
      presets: {
        imports: true,
        packageJson: false,
        tailwindcss: false,
      },
    }),
    valid: ['tests/fixtures/valid/sort-imports'],
    invalid: ['tests/fixtures/invalid/sort-imports'],
  },
  {
    name: 'package-json',
    mode: 'format',
    config: defineOxfmtConfig({
      ignorePatterns: [],
      presets: {
        imports: false,
        packageJson: true,
        tailwindcss: false,
      },
    }),
    valid: ['tests/fixtures/valid/package-json'],
    invalid: ['tests/fixtures/invalid/package-json'],
  },
  {
    name: 'tailwindcss',
    mode: 'format',
    config: defineOxfmtConfig({
      ignorePatterns: [],
      presets: {
        imports: false,
        packageJson: false,
        tailwindcss: true,
      },
    }),
    valid: ['tests/fixtures/valid/tailwindcss'],
    invalid: ['tests/fixtures/invalid/tailwindcss'],
  },
]

describe('preset fixture coverage', () => {
  for (const suite of lintSuites) {
    it(`covers ${suite.name} fixtures`, async () => {
      const configFile = await createTempConfig(
        suite.mode === 'lint'
          ? `${suite.name}.oxlint.json`
          : `${suite.name}.oxfmt.json`,
        suite.config,
      )

      for (const directory of suite.valid) {
        const files = await listFixtures(directory)
        expect(files.length).toBeGreaterThan(0)

        for (const file of files) {
          const filepath = join(directory, file)
          if (suite.mode === 'lint') {
            await expectLintPass(configFile, filepath)
          } else {
            await expectFormatPass(configFile, filepath)
          }
        }
      }

      for (const directory of suite.invalid) {
        const files = await listFixtures(directory)
        expect(files.length).toBeGreaterThan(0)

        for (const file of files) {
          const filepath = join(directory, file)
          if (suite.mode === 'lint') {
            await expectLintDiagnostics(configFile, filepath)
          } else {
            await expectFormatFailure(configFile, filepath)
          }
        }
      }
    })
  }
})

import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { delimiter, dirname, join } from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import { defineConfig } from '../src/index'

const execFileAsync = promisify(execFile)
const tempDirs: string[] = []

function createFileContent(
  totalLines: number,
  header: string[],
  body: (index: number) => string,
  footer: string[],
) {
  const bodyLineCount = totalLines - header.length - footer.length
  const lines = [
    ...header,
    ...Array.from({ length: bodyLineCount }, (_, index) => body(index)),
    ...footer,
  ]

  expect(bodyLineCount).toBeGreaterThanOrEqual(0)
  expect(lines).toHaveLength(totalLines)

  return lines.join('\n')
}

function createJavaScriptModule(totalLines: number) {
  return createFileContent(totalLines, [], (index) => {
    const value = index + 1
    return `export const value${value} = ${value}`
  }, [])
}

function createComponentFile(totalLines: number) {
  return createFileContent(
    totalLines,
    ['export function Example() {', '  return (', '    <>'],
    (index) => `      <div>${index + 1}</div>`,
    ['    </>', '  )', '}'],
  )
}

function createTestFile(totalLines: number) {
  return createFileContent(
    totalLines,
    [
      "import { describe, expect, it } from 'vitest'",
      "describe('suite', () => {",
      "  it('works', () => {",
    ],
    () => '    expect(1).toBe(1)',
    ['  })', '})'],
  )
}

async function createTempWorkspace() {
  const directory = await mkdtemp(join(tmpdir(), 'oxlint-config-max-lines-'))
  tempDirs.push(directory)
  return directory
}

async function writeTempFile(
  directory: string,
  relativePath: string,
  content: string,
) {
  const filepath = join(directory, relativePath)
  await mkdir(dirname(filepath), { recursive: true })
  await writeFile(filepath, content)
  return relativePath
}

async function createTempConfig(directory: string) {
  const filepath = join(directory, 'oxlint.config.json')
  const config = defineConfig({
    presets: {
      next: false,
      node: false,
      react: true,
      test: true,
      typescript: true,
    },
  })

  await writeFile(filepath, JSON.stringify(config, null, 2))
  return 'oxlint.config.json'
}

function resolveOxlintBinary() {
  return join(process.cwd(), 'node_modules/.bin/oxlint')
}

function createCommandEnv() {
  const binDirectory = join(process.cwd(), 'node_modules/.bin')

  return {
    ...process.env,
    PATH: `${binDirectory}${delimiter}${process.env.PATH ?? ''}`,
  }
}

async function expectLintPass(
  directory: string,
  configFile: string,
  filepath: string,
) {
  try {
    await execFileAsync(resolveOxlintBinary(), ['-c', configFile, filepath], {
      cwd: directory,
      env: createCommandEnv(),
    })
  } catch (error) {
    const failure = error as Error & { stderr?: string; stdout?: string }
    throw new Error(
      `${failure.message}\n${failure.stdout ?? ''}${failure.stderr ?? ''}`.trim(),
    )
  }
}

async function expectLintFailure(
  directory: string,
  configFile: string,
  filepath: string,
) {
  try {
    await expectLintPass(directory, configFile, filepath)
    throw new Error(`Expected lint failure for ${filepath}`)
  } catch (error) {
    return error as Error & { stderr?: string; stdout?: string }
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

describe('max-lines defaults', () => {
  it('limits regular source files to 300 lines', async () => {
    const directory = await createTempWorkspace()
    const configFile = await createTempConfig(directory)
    const validFile = await writeTempFile(
      directory,
      'src/valid.js',
      createJavaScriptModule(300),
    )
    const invalidFile = await writeTempFile(
      directory,
      'src/invalid.js',
      createJavaScriptModule(301),
    )

    await expectLintPass(directory, configFile, validFile)

    const failure = await expectLintFailure(directory, configFile, invalidFile)
    const output = `${failure.stdout ?? ''}${failure.stderr ?? ''}${failure.message}`

    expect(output).toContain('max-lines')
  })

  it('limits component files to 200 lines', async () => {
    const directory = await createTempWorkspace()
    const configFile = await createTempConfig(directory)
    const validFile = await writeTempFile(
      directory,
      'src/ValidComponent.tsx',
      createComponentFile(200),
    )
    const invalidFile = await writeTempFile(
      directory,
      'src/InvalidComponent.tsx',
      createComponentFile(201),
    )

    await expectLintPass(directory, configFile, validFile)

    const failure = await expectLintFailure(directory, configFile, invalidFile)
    const output = `${failure.stdout ?? ''}${failure.stderr ?? ''}${failure.message}`

    expect(output).toContain('max-lines')
  })

  it('limits test files to 500 lines even when they are tsx files', async () => {
    const directory = await createTempWorkspace()
    const configFile = await createTempConfig(directory)
    const validFile = await writeTempFile(
      directory,
      'src/component.test.tsx',
      createTestFile(500),
    )
    const invalidFile = await writeTempFile(
      directory,
      'src/component-too-long.test.tsx',
      createTestFile(501),
    )

    await expectLintPass(directory, configFile, validFile)

    const failure = await expectLintFailure(directory, configFile, invalidFile)
    const output = `${failure.stdout ?? ''}${failure.stderr ?? ''}${failure.message}`

    expect(output).toContain('max-lines')
  })
})

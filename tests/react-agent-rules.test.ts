import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { delimiter, dirname, join } from 'node:path'
import { promisify } from 'node:util'

import { afterEach, describe, expect, it } from 'vitest'

import { defineConfig } from '../src/index'

const execFileAsync = promisify(execFile)
const tempDirs: string[] = []

async function createWorkspace() {
  const directory = await mkdtemp(
    join(process.cwd(), '.tmp-react-agent-rules-'),
  )
  tempDirs.push(directory)
  return directory
}

function createCommandEnv() {
  const binDirectory = join(process.cwd(), 'node_modules/.bin')

  return {
    ...process.env,
    PATH: `${binDirectory}${delimiter}${process.env.PATH ?? ''}`,
  }
}

function resolveOxlintBinary() {
  return join(process.cwd(), 'node_modules/.bin/oxlint')
}

async function writeFileInWorkspace(
  directory: string,
  relativePath: string,
  content: string,
) {
  const filepath = join(directory, relativePath)
  await mkdir(dirname(filepath), { recursive: true })
  await writeFile(filepath, content)
  return relativePath
}

async function createConfig(directory: string) {
  const config = defineConfig({
    presets: {
      ignores: false,
      imports: false,
      javascript: false,
      next: false,
      node: false,
      react: true,
      reactAgentRules: true,
      test: false,
      typescript: false,
      unicorn: false,
    },
  })

  const filepath = join(directory, 'oxlint.config.json')
  await writeFile(filepath, JSON.stringify(config, null, 2))

  return 'oxlint.config.json'
}

async function lintFile(
  directory: string,
  configFile: string,
  filepath: string,
) {
  try {
    await execFileAsync(resolveOxlintBinary(), ['-c', configFile, filepath], {
      cwd: directory,
      env: createCommandEnv(),
    })
    return ''
  } catch (error) {
    const failure = error as Error & { stderr?: string; stdout?: string }
    return `${failure.stdout ?? ''}${failure.stderr ?? ''}${failure.message}`
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

describe('react-agent-rules preset', () => {
  it('reports manual memoization and forwardRef usage', async () => {
    const directory = await createWorkspace()
    const configFile = await createConfig(directory)
    const filepath = await writeFileInWorkspace(
      directory,
      'src/invalid.tsx',
      `
        import React, {
          forwardRef,
          memo,
          useCallback,
          useMemo,
        } from 'react'

        export const A = memo(() => null)
        export const B = React.memo(() => null)
        export const C = useMemo(() => 1, [])
        export const D = useCallback(() => {}, [])
        export const E = forwardRef(function Example(_, ref) {
          return <button ref={ref} />
        })
        export const F = React.forwardRef(function Example(_, ref) {
          return <button ref={ref} />
        })
      `,
    )

    const output = await lintFile(directory, configFile, filepath)

    expect(output).toContain('React Compiler automatically optimizes')
    expect(output).toContain('Starting in React 19, ref is a prop')
  })

  it('reports non-empty or missing effect deps', async () => {
    const directory = await createWorkspace()
    const configFile = await createConfig(directory)
    const filepath = await writeFileInWorkspace(
      directory,
      'src/effect.tsx',
      `
        import React, { useEffect, useLayoutEffect } from 'react'

        export function Example({ value }) {
          useEffect(() => {
            console.log(value)
          }, [value])

          React.useEffect(() => {
            console.log(value)
          })

          useLayoutEffect(() => {
            console.log(value)
          }, [value])

          return null
        }
      `,
    )

    const output = await lintFile(directory, configFile, filepath)

    expect(output).toContain('Effects here must use an empty dependency array')
  })

  it('accepts empty dependency arrays', async () => {
    const directory = await createWorkspace()
    const configFile = await createConfig(directory)
    const filepath = await writeFileInWorkspace(
      directory,
      'src/valid.tsx',
      `
        import { useEffect, useLayoutEffect } from 'react'

        export function Example() {
          useEffect(() => {}, [])
          useLayoutEffect(() => {}, [])
          return null
        }
      `,
    )

    const output = await lintFile(directory, configFile, filepath)

    expect(output).toBe('')
  })

  it('does not report imports when the banned apis are not called', async () => {
    const directory = await createWorkspace()
    const configFile = await createConfig(directory)
    const filepath = await writeFileInWorkspace(
      directory,
      'src/import-only.tsx',
      `
        import React, {
          forwardRef,
          memo,
          useCallback,
          useEffect,
          useLayoutEffect,
          useMemo,
        } from 'react'

        export const apis = {
          React,
          forwardRef,
          memo,
          useCallback,
          useEffect,
          useLayoutEffect,
          useMemo,
        }
      `,
    )

    const output = await lintFile(directory, configFile, filepath)

    expect(output).toBe('')
  })
})

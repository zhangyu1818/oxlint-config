import { execFile } from 'node:child_process'
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { isAbsolute, join } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const root = process.cwd()
const packageJson = JSON.parse(
  await readFile(join(root, 'package.json'), 'utf8'),
)
const distEntry = join(root, 'dist/index.js')

function exactVersion(range, name) {
  if (typeof range !== 'string') {
    throw new TypeError(`Missing peer dependency for ${name}`)
  }

  const match = range.match(/\d+\.\d+\.\d+(?:-[\w.-]+)?/)

  if (!match) {
    throw new Error(`Cannot resolve exact version for ${name}: ${range}`)
  }

  return match[0]
}

async function run(command, args, options = {}) {
  try {
    return await execFileAsync(command, args, {
      maxBuffer: 10 * 1024 * 1024,
      ...options,
    })
  } catch (error) {
    const failure = error
    const output = [failure.stdout, failure.stderr, failure.message]
      .filter(Boolean)
      .join('\n')

    throw new Error(`Command failed: ${command} ${args.join(' ')}\n${output}`)
  }
}

async function resolveTarball(output, packDirectory) {
  const candidates = isAbsolute(output)
    ? [output]
    : [join(packDirectory, output), join(root, output)]

  for (const candidate of candidates) {
    try {
      await access(candidate)
      return candidate
    } catch {
      continue
    }
  }

  throw new Error(`Cannot resolve packed tarball path: ${output}`)
}

async function createConsumerPackage(directory) {
  await writeFile(
    join(directory, 'package.json'),
    `${JSON.stringify(
      {
        private: true,
        type: 'module',
      },
      null,
      2,
    )}\n`,
  )
}

async function writeConsumerSmoke(directory) {
  await writeFile(
    join(directory, 'smoke.mjs'),
    `import { writeFile } from 'node:fs/promises'
import { defineConfig, defineOxfmtConfig } from '@zhangyu1818/oxlint-config'

const lintConfig = defineConfig({
  presets: {
    ignores: false,
    imports: false,
    javascript: true,
    next: false,
    node: false,
    react: false,
    reactAgentRules: false,
    test: true,
    typescript: {
      enabled: true,
      options: {
        typeAware: false,
      },
    },
    unicorn: false,
  },
})
const formatConfig = defineOxfmtConfig({
  presets: {
    packageJson: false,
    tailwindcss: false,
  },
})

if (!lintConfig.rules || Object.keys(lintConfig.rules).length === 0) {
  throw new Error('Expected lint config rules')
}

if (!formatConfig.ignorePatterns || formatConfig.ignorePatterns.length === 0) {
  throw new Error('Expected formatter ignore patterns')
}

await writeFile('oxlint.config.json', JSON.stringify(lintConfig, null, 2))
await writeFile('oxfmt.config.json', JSON.stringify(formatConfig, null, 2))
await writeFile(
  'sample.test.ts',
  "import { describe, expect, it } from 'vitest'\\n\\ndescribe('math', () => {\\n  it('adds values', () => {\\n    expect(1 + 1).toBe(2)\\n  })\\n})\\n",
)
`,
  )
}

async function main() {
  await access(distEntry).catch(() => {
    throw new Error('Missing dist/index.js. Run pnpm run build first.')
  })

  const workspace = await mkdtemp(join(tmpdir(), 'oxlint-config-smoke-'))
  const packDirectory = join(workspace, 'packed')

  try {
    await mkdir(packDirectory)
    await createConsumerPackage(workspace)

    const { stdout } = await run(
      'pnpm',
      ['pack', '--pack-destination', packDirectory],
      { cwd: root },
    )
    const tarballOutput = stdout.trim().split(/\r?\n/).at(-1)

    if (!tarballOutput || !tarballOutput.endsWith('.tgz')) {
      throw new Error(`Cannot find packed tarball in output: ${stdout}`)
    }

    const tarball = await resolveTarball(tarballOutput, packDirectory)
    const peerDependencies = packageJson.peerDependencies ?? {}
    const peerInstallSpecs = ['oxfmt', 'oxlint', 'oxlint-tsgolint'].map(
      (name) => `${name}@${exactVersion(peerDependencies[name], name)}`,
    )

    await run('pnpm', ['add', tarball, ...peerInstallSpecs], {
      cwd: workspace,
    })
    await writeConsumerSmoke(workspace)
    await run('node', ['smoke.mjs'], { cwd: workspace })
    await run(
      'pnpm',
      ['exec', 'oxlint', '-c', 'oxlint.config.json', 'sample.test.ts'],
      {
        cwd: workspace,
      },
    )
    await run(
      'pnpm',
      ['exec', 'oxfmt', '--check', '-c', 'oxfmt.config.json', 'sample.test.ts'],
      { cwd: workspace },
    )
  } finally {
    if (!process.env.SMOKE_KEEP_TMP) {
      await rm(workspace, {
        force: true,
        recursive: true,
      })
    }
  }
}

await main()

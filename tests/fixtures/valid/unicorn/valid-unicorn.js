import path from 'node:path'

const items = ['src/index.ts']

const filepath = path.join(...items)

if (items.length !== 0) {
  console.warn(filepath)
}

export { filepath }

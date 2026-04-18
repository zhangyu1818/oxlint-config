import path from 'path'

const items = ['src/index.ts']
const values = new Array('src/index.ts')

if (items.length > 0) {
  console.warn(path.join(...values))
}

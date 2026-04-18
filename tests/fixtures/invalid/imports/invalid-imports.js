import path from 'node:path'
import { join } from 'node:path'

export let mutablePath = join('src', 'index.ts')

console.log(path, mutablePath)

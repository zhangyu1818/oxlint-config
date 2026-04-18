import { component } from './_local'
import path from 'node:path'
import type { Dirent } from 'node:fs'

export const example = (entry: Dirent) => path.basename(component ?? entry.name)

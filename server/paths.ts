import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const solutionsDir = path.join(rootDir, 'solutions')
export const libDir = path.join(rootDir, 'lib')
export const webDir = path.join(rootDir, 'web')
export const progressFile = path.join(rootDir, 'progress.json')
export const localDir = path.join(rootDir, '.local')
export const settingsFile = path.join(localDir, 'config.json')

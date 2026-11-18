import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { progressFile } from './paths.ts'

export interface TestSet {
  id: string
  name: string
}

export interface Entry {
  name?: string
  // AoC
  stars?: [boolean, boolean]
  answers?: [string | null, string | null]
  // Euler
  solved?: boolean
  answer?: string | null
  // Both
  dataSet?: string
  testSets?: TestSet[]
}

export interface Progress {
  meta: { eulerCount?: number; eulerNamesFetchedAt?: string }
  problems: Record<string, Entry>
}

let progress: Progress = load()
let writeTimer: NodeJS.Timeout | null = null
const listeners = new Set<() => void>()

function load(): Progress {
  if (!existsSync(progressFile)) return { meta: {}, problems: {} }
  const data = JSON.parse(readFileSync(progressFile, 'utf8'))
  return { meta: data.meta ?? {}, problems: data.problems ?? {} }
}

export const getProgress = () => progress
export const getEntry = (id: string): Entry => progress.problems[id] ?? {}

export const onProgressChange = (fn: () => void) => listeners.add(fn)

export function updateEntry(id: string, patch: Partial<Entry>) {
  progress.problems[id] = { ...getEntry(id), ...patch }
  changed()
}

export function updateMeta(patch: Partial<Progress['meta']>) {
  progress.meta = { ...progress.meta, ...patch }
  changed()
}

function changed() {
  listeners.forEach(fn => fn())
  if (writeTimer) clearTimeout(writeTimer)
  writeTimer = setTimeout(flush, 200)
}

export function flush() {
  if (writeTimer) clearTimeout(writeTimer)
  writeTimer = null
  const problems = Object.fromEntries(
    Object.entries(progress.problems).sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true })),
  )
  const tmp = `${progressFile}.tmp`
  writeFileSync(tmp, JSON.stringify({ meta: progress.meta, problems }, null, 2) + '\n')
  renameSync(tmp, progressFile)
}

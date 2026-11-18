import path from 'node:path'
import { statSync } from 'node:fs'
import { watch } from 'chokidar'
import { libDir, solutionsDir } from './paths.ts'
import { isStarted } from './problems.ts'
import { dataSetFile, getRun, run } from './runner.ts'

const subscribers = new Map<string, number>()
const timers = new Map<string, NodeJS.Timeout>()

export function subscribe(id: string) {
  subscribers.set(id, (subscribers.get(id) ?? 0) + 1)
}

export function unsubscribe(id: string) {
  const count = (subscribers.get(id) ?? 0) - 1
  if (count > 0) subscribers.set(id, count)
  else subscribers.delete(id)
}

/** Debounced so an editor's save-then-format doesn't start two runs. */
function scheduleRun(id: string, file: string) {
  // Skip events for writes the latest run already picked up (e.g. the late 'add' after Start).
  const startedAt = getRun(id)?.startedAt ?? 0
  try {
    if (statSync(file).mtimeMs < startedAt) return
  } catch {}
  clearTimeout(timers.get(id))
  timers.set(
    id,
    setTimeout(() => {
      timers.delete(id)
      if (isStarted(id)) run(id)
    }, 100),
  )
}

function onFileChange(file: string) {
  if (file.startsWith(libDir + path.sep)) {
    if (file.endsWith('.ts')) subscribers.forEach((_, id) => scheduleRun(id, file))
    return
  }
  const id = path.relative(solutionsDir, path.dirname(file)).split(path.sep).join('/')
  if (!subscribers.has(id)) return
  const name = path.basename(file)
  // vis.ts is reloaded by Vite in the visualization tab; it doesn't affect the solution run.
  if ((name.endsWith('.ts') && name !== 'vis.ts') || file === dataSetFile(id)) scheduleRun(id, file)
}

export function startWatcher() {
  watch([solutionsDir, libDir], {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
  })
    .on('add', onFileChange)
    .on('change', onFileChange)
}

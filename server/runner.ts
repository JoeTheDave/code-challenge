import path from 'node:path'
import { fork, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import { getEntry } from './progress.ts'
import { inputFile, parseId, solutionFile, testFile } from './problems.ts'
import { rootDir } from './paths.ts'

export interface PartResult {
  part: number
  value: string | null
  ms: number
  error?: string
}

export interface RunState {
  runId: number
  dataSet: string
  status: 'running' | 'done' | 'stopped'
  output: string
  results: PartResult[]
  startedAt: number
  endedAt?: number
}

export type RunEvent =
  | { type: 'run-start'; id: string; run: RunState }
  | { type: 'output'; id: string; runId: number; data: string }
  | { type: 'result'; id: string; runId: number; result: PartResult }
  | { type: 'run-end'; id: string; runId: number; status: RunState['status']; endedAt: number }

const childScript = path.join(rootDir, 'server', 'runner-child.ts')
const runs = new Map<string, { state: RunState; child: ChildProcess | null }>()
const listeners = new Set<(e: RunEvent) => void>()
let nextRunId = 1

export const onRunEvent = (fn: (e: RunEvent) => void) => listeners.add(fn)
const emit = (e: RunEvent) => listeners.forEach(fn => fn(e))

export const getRun = (id: string) => runs.get(id)?.state ?? null

/** Path of the file for the problem's selected data set, or '' when it has no input. */
export function dataSetFile(id: string) {
  const entry = getEntry(id)
  const dataSet = entry.dataSet ?? 'input'
  if (dataSet !== 'input' && entry.testSets?.some(t => t.id === dataSet)) return testFile(id, dataSet)
  return existsSync(inputFile(id)) ? inputFile(id) : ''
}

export function stop(id: string) {
  const run = runs.get(id)
  if (run?.child && run.state.status === 'running') {
    run.state.status = 'stopped'
    run.child.kill('SIGKILL')
  }
}

export function run(id: string) {
  const problem = parseId(id)
  if (!problem || !existsSync(solutionFile(id))) return
  stop(id)

  const dataFile = dataSetFile(id)
  const state: RunState = {
    runId: nextRunId++,
    dataSet: getEntry(id).dataSet ?? 'input',
    status: 'running',
    output: '',
    results: [],
    startedAt: Date.now(),
  }
  const child = fork(childScript, [solutionFile(id), problem.kind, dataFile], {
    cwd: path.dirname(solutionFile(id)),
    execArgv: ['--import', 'tsx'],
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    env: { ...process.env, FORCE_COLOR: '1' },
  })
  const record = { state, child: child as ChildProcess | null }
  runs.set(id, record)
  emit({ type: 'run-start', id, run: { ...state } })

  const isCurrent = () => runs.get(id) === record
  const onData = (chunk: Buffer) => {
    const data = chunk.toString()
    state.output += data
    if (isCurrent()) emit({ type: 'output', id, runId: state.runId, data })
  }
  child.stdout!.on('data', onData)
  child.stderr!.on('data', onData)

  let killTimer: NodeJS.Timeout | undefined
  child.on('message', (msg: { type: string } & PartResult) => {
    if (msg.type === 'result') {
      const { part, value, ms, error } = msg
      const result = { part, value, ms, error }
      state.results.push(result)
      if (isCurrent()) emit({ type: 'result', id, runId: state.runId, result })
    } else if (msg.type === 'done') {
      // Give stdout a moment to drain, then make sure nothing the solution left open keeps it alive.
      killTimer = setTimeout(() => child.kill('SIGKILL'), 1000)
    }
  })
  child.on('close', () => {
    clearTimeout(killTimer)
    record.child = null
    if (state.status === 'running') state.status = 'done'
    state.endedAt = Date.now()
    if (isCurrent()) emit({ type: 'run-end', id, runId: state.runId, status: state.status, endedAt: state.endedAt })
  })
}

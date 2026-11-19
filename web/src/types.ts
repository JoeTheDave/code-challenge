export interface TestSet {
  id: string
  name: string
}

export interface Entry {
  name?: string
  stars?: [boolean, boolean]
  answers?: [string | null, string | null]
  solved?: boolean
  answer?: string | null
  dataSet?: string
  parts?: [boolean, boolean]
  issue?: string
  testSets?: TestSet[]
}

export interface YearInfo {
  year: number
  days: number
  unlocked: number
}

export interface Overview {
  years: YearInfo[]
  eulerCount: number
  problems: Record<string, Entry>
  started: string[]
  settings: PublicSettings
}

export interface PublicSettings {
  hasAocSession: boolean
  hasEulerCookie: boolean
  contact: string
}

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

export type Detail = (
  | { kind: 'aoc'; year: number; day: number }
  | { kind: 'euler'; number: number }
) & {
  id: string
  entry: Entry
  url: string
  started: boolean
  hasInput: boolean
  hasVis: boolean
  visPath: string
  testSets: (TestSet & { content: string })[]
  run: RunState | null
  prev: string | null
  next: string | null
}

export type ServerMessage =
  | { type: 'progress' }
  | { type: 'connected' }
  | { type: 'run-start'; id: string; run: RunState }
  | { type: 'run-snapshot'; id: string; run: RunState }
  | { type: 'output'; id: string; runId: number; data: string }
  | { type: 'result'; id: string; runId: number; result: PartResult }
  | { type: 'run-end'; id: string; runId: number; status: RunState['status']; endedAt: number }

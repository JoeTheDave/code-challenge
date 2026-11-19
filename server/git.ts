import { execFile } from 'node:child_process'
import { isDeepStrictEqual } from 'node:util'
import { rootDir } from './paths.ts'

export type GitCommit = { hash: string; subject: string }
export type GitFile = { code: string; path: string }

export type GitStatus = {
  repo: boolean
  branch: string | null
  upstream: string | null
  /** Uncommitted changes in the working tree (staged, unstaged, untracked). */
  files: GitFile[]
  /** Local commits not on the upstream. */
  ahead: GitCommit[]
  aheadCount: number
  /** Upstream commits not in the local branch (as of the last fetch). */
  behind: GitCommit[]
  behindCount: number
  lastFetchAt: number | null
  fetching: boolean
  fetchError: string | null
}

const LOCAL_INTERVAL = 5_000
const FETCH_INTERVAL = 5 * 60_000
const FOCUS_MIN_AGE = 60_000
const FETCH_TIMEOUT = 20_000
const LOG_LIMIT = 20

function git(args: string[], timeout = 10_000) {
  return new Promise<string>((resolve, reject) => {
    execFile(
      'git',
      args,
      {
        cwd: rootDir,
        timeout,
        maxBuffer: 4 * 1024 * 1024,
        // Never prompt: there is no one at the terminal to answer.
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_SSH_COMMAND: 'ssh -o BatchMode=yes' },
      },
      (err, stdout, stderr) => (err ? reject(new Error(stderr.trim() || err.message)) : resolve(stdout)),
    )
  })
}

/** Parses `git status --porcelain=v2 --branch -z`. */
export function parseStatus(out: string) {
  const tokens = out.split('\0')
  let branch: string | null = null
  let upstream: string | null = null
  let aheadCount = 0
  let behindCount = 0
  const files: GitFile[] = []
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (!t) continue
    if (t.startsWith('# branch.head ')) {
      const head = t.slice(14)
      branch = head === '(detached)' ? null : head
    } else if (t.startsWith('# branch.upstream ')) upstream = t.slice(18)
    else if (t.startsWith('# branch.ab ')) {
      const m = t.match(/\+(\d+) -(\d+)/)
      if (m) [aheadCount, behindCount] = [Number(m[1]), Number(m[2])]
    } else if (t.startsWith('? ')) files.push({ code: '??', path: t.slice(2) })
    else if (t[0] === '1' || t[0] === '2' || t[0] === 'u') {
      // Fixed fields before the path: 1 → 8, 2 → 9, u → 10.
      const fixed = t[0] === '1' ? 8 : t[0] === '2' ? 9 : 10
      const parts = t.split(' ')
      files.push({ code: parts[1].replace(/\./g, ' ').trim(), path: parts.slice(fixed).join(' ') })
      if (t[0] === '2') i++ // a rename is followed by its original path
    }
  }
  return { branch, upstream, aheadCount, behindCount, files }
}

const parseLog = (out: string): GitCommit[] =>
  out
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const [hash, ...rest] = line.split('\t')
      return { hash, subject: rest.join('\t') }
    })

let status: GitStatus = {
  repo: false,
  branch: null,
  upstream: null,
  files: [],
  ahead: [],
  aheadCount: 0,
  behind: [],
  behindCount: 0,
  lastFetchAt: null,
  fetching: false,
  fetchError: null,
}

const listeners = new Set<(s: GitStatus) => void>()
export const onGitChange = (fn: (s: GitStatus) => void) => void listeners.add(fn)
export const getGitStatus = () => status

function set(patch: Partial<GitStatus>) {
  const next = { ...status, ...patch }
  if (isDeepStrictEqual(next, status)) return
  status = next
  listeners.forEach(fn => fn(status))
}

let refreshing: Promise<void> | null = null

/** Re-reads local state (no network). */
export function refreshLocal() {
  refreshing ??= (async () => {
    try {
      const s = parseStatus(await git(['status', '--porcelain=v2', '--branch', '-z', '--untracked-files=all']))
      const log = (range: string) => git(['log', `--max-count=${LOG_LIMIT}`, '--format=%h%x09%s', range]).then(parseLog)
      const [ahead, behind] = s.upstream
        ? await Promise.all([
            s.aheadCount ? log('@{u}..HEAD') : [],
            s.behindCount ? log('HEAD..@{u}') : [],
          ])
        : [[], []]
      set({ repo: true, ...s, ahead, behind })
    } catch {
      set({ repo: false })
    } finally {
      refreshing = null
    }
  })()
  return refreshing
}

let fetching: Promise<void> | null = null

/** Fetches the upstream's remote, then re-reads. Skips if the last fetch is younger than `minAge`. */
export function fetchRemote(minAge = 0) {
  if (fetching) return fetching
  if (!status.repo || !status.upstream) return refreshLocal()
  if (status.lastFetchAt && Date.now() - status.lastFetchAt < minAge) return Promise.resolve()
  const remote = status.upstream.split('/')[0]
  set({ fetching: true })
  fetching = (async () => {
    try {
      await git(['fetch', '--quiet', remote], FETCH_TIMEOUT)
      set({ fetchError: null })
    } catch (e) {
      set({ fetchError: (e as Error).message.split('\n')[0] })
    } finally {
      // Stamp failures too, so the cadence doesn't hammer an unreachable remote.
      set({ fetching: false, lastFetchAt: Date.now() })
      fetching = null
    }
    await refreshLocal()
  })()
  return fetching
}

export const fetchOnFocus = () => fetchRemote(FOCUS_MIN_AGE)

/** Polls while a browser is connected: local state every 5s, the remote every 5 minutes. */
export function startGitMonitor(hasClients: () => boolean) {
  void refreshLocal().then(() => fetchRemote())
  setInterval(() => {
    if (!hasClients()) return
    // A fetch re-reads local state itself; otherwise just re-read.
    if (!fetching && Date.now() - (status.lastFetchAt ?? 0) >= FETCH_INTERVAL) void fetchRemote()
    else void refreshLocal()
  }, LOCAL_INTERVAL).unref()
}

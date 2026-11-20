import { execFile } from 'node:child_process'
import { isDeepStrictEqual } from 'node:util'
import { rootDir } from './paths.ts'
import { reload as reloadProgress } from './progress.ts'

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
  /** A commit/push/pull in progress. */
  busy: 'commit' | 'push' | 'pull' | null
}

const LOCAL_INTERVAL = 5_000
const FETCH_INTERVAL = 5 * 60_000
const FOCUS_MIN_AGE = 60_000
const FETCH_TIMEOUT = 20_000
const OP_TIMEOUT = 60_000
const LOG_LIMIT = 20

let repoDir = rootDir
/** For tests: point at a scratch repo. */
export const setRepoDir = (dir: string) => void (repoDir = dir)

function git(args: string[], timeout = 10_000) {
  return new Promise<string>((resolve, reject) => {
    execFile(
      'git',
      args,
      {
        cwd: repoDir,
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
  busy: null,
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
  if (status.busy) return Promise.resolve()
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

// ---- Actions ----------------------------------------------------------------

/** A refusal or git failure the UI should show as-is. */
export class GitOpError extends Error {}

const firstLines = (msg: string) => msg.split('\n').filter(Boolean).slice(0, 4).join('\n')

async function op<T>(name: NonNullable<GitStatus['busy']>, fn: () => Promise<T>) {
  if (status.busy) throw new GitOpError(`Busy: a ${status.busy} is already running.`)
  set({ busy: name })
  try {
    await fetching
    await refreshing
    await refreshLocal()
    return await fn()
  } catch (e) {
    throw e instanceof GitOpError ? e : new GitOpError(firstLines((e as Error).message))
  } finally {
    set({ busy: null })
    // An in-flight read may predate this op; wait it out so the re-read is fresh.
    await refreshing
    await refreshLocal()
  }
}

/** Stages everything (tracked, untracked, deletions) and commits it. */
export const commitAll = (message: string) =>
  op('commit', async () => {
    if (!message.trim()) throw new GitOpError('A commit message is required.')
    if (!status.files.length) throw new GitOpError('Nothing to commit.')
    await git(['add', '--all'])
    await git(['commit', '--quiet', '-m', message.trim()])
  })

export const push = () =>
  op('push', async () => {
    if (!status.upstream) throw new GitOpError('This branch has no upstream to push to.')
    if (status.behindCount) throw new GitOpError('GitHub has commits you don\'t have. Pull first.')
    if (!status.aheadCount) throw new GitOpError('Nothing to push.')
    await git(['push', '--quiet'], OP_TIMEOUT)
    set({ lastFetchAt: Date.now(), fetchError: null })
  })

/**
 * Rebases local commits onto the upstream. Requires a clean tree, so uncommitted edits are never
 * stashed and re-applied into a conflict. A failed rebase is aborted, leaving the repo as it was.
 */
export const pull = () =>
  op('pull', async () => {
    if (!status.upstream) throw new GitOpError('This branch has no upstream to pull from.')
    if (status.files.length) throw new GitOpError('Commit your changes before pulling.')
    try {
      await git(['pull', '--rebase', '--quiet'], OP_TIMEOUT)
      // The pull may have rewritten progress.json; the server holds it in memory.
      reloadProgress()
      set({ lastFetchAt: Date.now(), fetchError: null })
    } catch (e) {
      const aborted = await git(['rebase', '--abort']).then(
        () => true,
        () => false,
      )
      const msg = firstLines((e as Error).message)
      throw new GitOpError(
        aborted ? `Pull hit a conflict and was undone; nothing changed.\n${msg}` : msg,
      )
    }
  })

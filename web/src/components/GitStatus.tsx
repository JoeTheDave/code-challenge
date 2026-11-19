import { useEffect, useRef, useState } from 'react'
import { api, onMessage } from '../api'
import { Toast, useToast } from './Toast'
import type { GitCommit, GitStatus as Status } from '../types'

function ago(ts: number | null, now: number) {
  if (!ts) return 'never'
  const s = Math.max(0, Math.round((now - ts) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  return m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`
}

/** "Update aoc/2016/01, progress.json" from the changed paths. */
export function defaultMessage(files: Status['files']) {
  const parts = new Set<string>()
  let other = 0
  for (const { path } of files) {
    const m = path.match(/^solutions\/(aoc\/\d{4}\/\d{2}|euler\/\d{3})\//)
    if (m) parts.add(m[1])
    else if (path === 'progress.json') parts.add('progress.json')
    else other++
  }
  const list = [...parts].sort((a, b) => Number(a === 'progress.json') - Number(b === 'progress.json') || a.localeCompare(b))
  if (other) list.push(plural(other, 'other file'))
  return list.length ? `Update ${list.join(', ')}` : 'Update'
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

function Commits({ list, total }: { list: GitCommit[]; total: number }) {
  return (
    <ul className="git-list">
      {list.map(c => (
        <li key={c.hash}>
          <code className="muted">{c.hash}</code> {c.subject}
        </li>
      ))}
      {total > list.length && <li className="muted">…and {total - list.length} more</li>}
    </ul>
  )
}

/** Top-bar pill showing whether the local repo and GitHub agree; click for details. */
export function GitStatus() {
  const [status, setStatus] = useState<Status | null>(null)
  const [open, setOpen] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [message, setMessage] = useState('')
  const [edited, setEdited] = useState(false)
  const { toast, setToast, dismiss } = useToast()
  const root = useRef<HTMLDivElement>(null)

  // Keep the suggested commit message current until the user types their own.
  const suggested = status ? defaultMessage(status.files) : ''
  useEffect(() => {
    if (!edited) setMessage(suggested)
  }, [suggested, edited])

  const act = async (steps: (() => Promise<Status>)[], done: string) => {
    setToast(null)
    try {
      for (const step of steps) setStatus(await step())
      setToast({ kind: 'ok', text: done })
      return true
    } catch (e) {
      setToast({ kind: 'error', text: (e as Error).message })
      return false
    }
  }
  const commit = async (andPush: boolean) => {
    const steps = [() => api.gitCommit(message)]
    if (andPush) steps.push(() => api.gitPush())
    if (await act(steps, andPush ? 'Committed and pushed to GitHub.' : 'Committed.')) setEdited(false)
  }

  useEffect(() => {
    const load = () => api.git().then(setStatus, () => {})
    load()
    const off = onMessage(msg => {
      if (msg.type === 'git') setStatus(msg.status)
      else if (msg.type === 'connected') load()
    })
    // Coming back to the tab is when a stale checkout matters; the server throttles this.
    const onFocus = () => api.gitFetch().then(setStatus, () => {})
    window.addEventListener('focus', onFocus)
    const tick = setInterval(() => setNow(Date.now()), 30_000)
    return () => {
      off()
      window.removeEventListener('focus', onFocus)
      clearInterval(tick)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setNow(Date.now())
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!status) return null
  if (!status.repo) return <span className="pill">not a git repo</span>

  const dirty = status.files.length
  const segments: { text: string; cls: string }[] = []
  if (status.behindCount) segments.push({ text: `↓ ${status.behindCount} to pull`, cls: 'behind' })
  if (status.aheadCount) segments.push({ text: `↑ ${status.aheadCount} to push`, cls: 'ahead' })
  if (dirty) segments.push({ text: `● ${dirty} uncommitted`, cls: 'dirty' })
  if (!status.upstream) segments.push({ text: 'no remote branch', cls: 'none' })
  if (!segments.length) segments.push({ text: '✓ synced', cls: 'synced' })
  const pillCls = segments[0].cls
  const busy = status.busy !== null
  const busyLabel = { commit: 'Committing…', push: 'Pushing…', pull: 'Pulling…' } as const

  return (
    <div className="git-status" ref={root}>
      <button
        className={`git-pill ${pillCls}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Local vs GitHub"
      >
        {(status.fetching || busy) && <span className="git-spin" aria-label="Working" />}
        {segments.map(s => (
          <span key={s.cls} className={`git-seg ${s.cls}`}>
            {s.text}
          </span>
        ))}
        {status.fetchError && <span className="git-seg error" title={status.fetchError}>⚠</span>}
      </button>

      {open && (
        <div className="git-panel" role="dialog" aria-label="Git sync status">
          <div className="git-panel-head">
            <span>
              <code>{status.branch ?? '(detached)'}</code>
              {status.upstream && <span className="muted"> → {status.upstream}</span>}
            </span>
            <button className="icon" onClick={() => setOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>

          {status.behindCount > 0 && (
            <section>
              <h3 className="behind">↓ {plural(status.behindCount, 'commit')} on GitHub, not here</h3>
              <Commits list={status.behind} total={status.behindCount} />
              {dirty ? (
                <p className="muted git-hint">Commit your changes below, then pull.</p>
              ) : (
                <div className="git-actions">
                  <button className="primary" disabled={busy} onClick={() => act([api.gitPull], 'Pulled from GitHub.')}>
                    {status.busy === 'pull' ? busyLabel.pull : 'Pull'}
                  </button>
                </div>
              )}
            </section>
          )}
          {status.aheadCount > 0 && (
            <section>
              <h3 className="ahead">↑ {plural(status.aheadCount, 'commit')} here, not on GitHub</h3>
              <Commits list={status.ahead} total={status.aheadCount} />
              {!status.behindCount && (
                <div className="git-actions">
                  <button className="primary" disabled={busy} onClick={() => act([api.gitPush], 'Pushed to GitHub.')}>
                    {status.busy === 'push' ? busyLabel.push : 'Push'}
                  </button>
                </div>
              )}
              {status.behindCount > 0 && <p className="muted git-hint">Pull first, then push.</p>}
            </section>
          )}
          {dirty > 0 && (
            <section>
              <h3 className="dirty">● {plural(dirty, 'uncommitted file')}</h3>
              <ul className="git-list">
                {status.files.slice(0, 30).map(f => (
                  <li key={f.path}>
                    <code className="muted git-code">{f.code}</code> {f.path}
                  </li>
                ))}
                {dirty > 30 && <li className="muted">…and {dirty - 30} more</li>}
              </ul>
              <form
                className="git-commit"
                onSubmit={e => {
                  e.preventDefault()
                  void commit(false)
                }}
              >
                <input
                  value={message}
                  onChange={e => {
                    setMessage(e.target.value)
                    setEdited(true)
                  }}
                  placeholder="Commit message"
                  aria-label="Commit message"
                  disabled={busy}
                />
                <div className="git-actions">
                  <button type="submit" disabled={busy || !message.trim()}>
                    {status.busy === 'commit' ? busyLabel.commit : 'Commit all'}
                  </button>
                  {status.upstream && !status.behindCount && (
                    <button type="button" className="primary" disabled={busy || !message.trim()} onClick={() => commit(true)}>
                      Commit & push
                    </button>
                  )}
                </div>
              </form>
            </section>
          )}
          {!status.upstream && (
            <p className="muted">This branch has no upstream on GitHub, so there's nothing to compare against.</p>
          )}
          {segments[0].cls === 'synced' && <p className="synced">Local and GitHub match.</p>}

          <div className="git-panel-foot">
            <span className={status.fetchError ? 'error' : 'muted'}>
              {status.fetchError
                ? `Couldn't reach GitHub: ${status.fetchError}`
                : status.busy
                  ? busyLabel[status.busy]
                  : status.fetching
                  ? 'Checking GitHub…'
                  : `GitHub checked ${ago(status.lastFetchAt, now)}`}
            </span>
            {status.upstream && (
              <button
                onClick={() => api.gitFetch(true).then(setStatus, () => {})}
                disabled={status.fetching || busy}
              >
                Check now
              </button>
            )}
          </div>
        </div>
      )}

      <Toast toast={toast} onDismiss={dismiss} />
    </div>
  )
}

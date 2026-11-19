import { useEffect, useRef, useState } from 'react'
import { api, onMessage } from '../api'
import type { GitCommit, GitStatus as Status } from '../types'

function ago(ts: number | null, now: number) {
  if (!ts) return 'never'
  const s = Math.max(0, Math.round((now - ts) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  return m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`
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
  const root = useRef<HTMLDivElement>(null)

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

  return (
    <div className="git-status" ref={root}>
      <button
        className={`git-pill ${pillCls}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Local vs GitHub"
      >
        {status.fetching && <span className="git-spin" aria-label="Checking GitHub" />}
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
              <p className="muted git-hint">
                Pull to get them: <code>git pull</code>
              </p>
            </section>
          )}
          {status.aheadCount > 0 && (
            <section>
              <h3 className="ahead">↑ {plural(status.aheadCount, 'commit')} here, not on GitHub</h3>
              <Commits list={status.ahead} total={status.aheadCount} />
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
                : status.fetching
                  ? 'Checking GitHub…'
                  : `GitHub checked ${ago(status.lastFetchAt, now)}`}
            </span>
            {status.upstream && (
              <button
                onClick={() => api.gitFetch(true).then(setStatus, () => {})}
                disabled={status.fetching}
              >
                Check now
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { PublicSettings } from '../types'

export function Settings() {
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [aocSession, setAocSession] = useState('')
  const [eulerCookie, setEulerCookie] = useState('')
  const [contact, setContact] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.settings().then(s => {
      setSettings(s)
      setContact(s.contact)
    })
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const patch: Record<string, string> = { contact }
    if (aocSession) patch.aocSession = aocSession
    if (eulerCookie) patch.eulerCookie = eulerCookie
    setSettings(await api.saveSettings(patch))
    setAocSession('')
    setEulerCookie('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const clear = async (field: 'aocSession' | 'eulerCookie') => setSettings(await api.saveSettings({ [field]: '' }))

  if (!settings) return <p className="page muted">Loading…</p>

  return (
    <div className="page settings">
      <header className="topbar">
        <Link to="/">← All problems</Link>
      </header>
      <h1>Settings</h1>
      <p className="muted">
        Stored in <code>.local/config.json</code> (gitignored). Values are never sent back to the browser.
      </p>
      <form onSubmit={save}>
        <label>
          <span>
            Advent of Code session cookie{' '}
            <Status set={settings.hasAocSession} onClear={() => clear('aocSession')} />
          </span>
          <input
            type="password"
            value={aocSession}
            onChange={e => setAocSession(e.target.value)}
            placeholder={settings.hasAocSession ? 'Paste a new value to replace' : 'session cookie value'}
            autoComplete="off"
          />
          <small>
            In your browser on adventofcode.com: DevTools → Application → Cookies → <code>session</code>. Used to fetch
            inputs and accepted answers.
          </small>
        </label>
        <label>
          <span>
            Project Euler cookies <Status set={settings.hasEulerCookie} onClear={() => clear('eulerCookie')} />
          </span>
          <input
            type="password"
            value={eulerCookie}
            onChange={e => setEulerCookie(e.target.value)}
            placeholder={settings.hasEulerCookie ? 'Paste a new value to replace' : 'name=value; name2=value2'}
            autoComplete="off"
          />
          <small>
            The full <code>Cookie</code> header from a logged-in request to projecteuler.net (DevTools → Network → any
            page → Request Headers). Used only to fetch accepted answers.
          </small>
        </label>
        <label>
          <span>Contact for User-Agent (optional)</span>
          <input value={contact} onChange={e => setContact(e.target.value)} placeholder="e.g. github.com/you" />
          <small>Advent of Code asks automated tools to include contact info in their User-Agent.</small>
        </label>
        <button className="primary" type="submit">
          Save
        </button>
        {saved && <span className="muted"> Saved</span>}
      </form>
    </div>
  )
}

function Status({ set, onClear }: { set: boolean; onClear: () => void }) {
  if (!set) return <span className="pill warn">not set</span>
  return (
    <>
      <span className="pill ok">set</span>{' '}
      <button type="button" className="link" onClick={onClear}>
        clear
      </button>
    </>
  )
}

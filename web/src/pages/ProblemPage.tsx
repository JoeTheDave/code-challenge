import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GitStatus } from '../components/GitStatus'
import { api, onMessage, subscribeProblem } from '../api'
import { Terminal, type TerminalHandle } from '../components/Terminal'
import { TestDrawer } from '../components/TestDrawer'
import { problemLabel, problemPath } from '../routes'
import type { Detail, RunState } from '../types'

const dim = (s: string) => `\x1b[2m${s}\x1b[0m`

const formatMs = (ms: number) => (ms < 1000 ? `${ms.toFixed(1)} ms` : `${(ms / 1000).toFixed(2)} s`)

function dataSetLabel(detail: Detail, dataSet: string) {
  if (dataSet !== 'input') return detail.testSets.find(t => t.id === dataSet)?.name ?? dataSet
  return detail.hasInput ? 'Puzzle Input' : 'No Input'
}

export function ProblemPage({ id }: { id: string }) {
  const [detail, setDetail] = useState<Detail | null>(null)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [run, setRun] = useState<RunState | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const term = useRef<TerminalHandle>(null)
  const detailRef = useRef<Detail | null>(null)
  const runIdRef = useRef(0)
  const runStartRef = useRef(0)
  // Everything shown in the terminal, so it can be replayed if the terminal mounts after output arrives.
  const termText = useRef('')
  detailRef.current = detail

  const resetTerm = (text: string) => {
    termText.current = text
    term.current?.reset(text)
  }
  const writeTerm = (text: string) => {
    termText.current += text
    term.current?.write(text)
  }

  const load = useCallback(
    () =>
      api.problem(id).then(
        d => {
          setDetail(d)
          setError('')
        },
        e => setError((e as Error).message),
      ),
    [id],
  )

  useEffect(() => {
    setDetail(null)
    setRun(null)
    setWarning('')
    setError('')
    resetTerm('')
    void load()
  }, [load])

  const header = (r: RunState) => {
    const d = detailRef.current
    const time = new Date(r.startedAt).toLocaleTimeString()
    return dim(`── ${d ? dataSetLabel(d, r.dataSet) : r.dataSet} · ${time} ──`) + '\n\n'
  }
  const footer = (r: { status: RunState['status']; startedAt: number; endedAt?: number }) =>
    r.status === 'stopped'
      ? '\x1b[33m■ stopped\x1b[0m\n'
      : dim(`✓ finished in ${formatMs((r.endedAt ?? Date.now()) - r.startedAt)}`) + '\n'

  useEffect(() => {
    const off = onMessage(msg => {
      if (msg.type === 'progress' || msg.type === 'connected') return void load()
      if (msg.type === 'git' || msg.id !== id) return
      switch (msg.type) {
        case 'run-start':
        case 'run-snapshot':
          runIdRef.current = msg.run.runId
          runStartRef.current = msg.run.startedAt
          setRun(msg.run)
          resetTerm(header(msg.run) + msg.run.output + (msg.run.status !== 'running' ? '\n' + footer(msg.run) : ''))
          break
        case 'output':
          if (msg.runId === runIdRef.current) writeTerm(msg.data)
          break
        case 'result':
          if (msg.runId === runIdRef.current)
            setRun(r => (r ? { ...r, results: [...r.results, msg.result] } : r))
          break
        case 'run-end':
          if (msg.runId !== runIdRef.current) break
          setRun(r => (r ? { ...r, status: msg.status, endedAt: msg.endedAt } : r))
          writeTerm('\n' + footer({ ...msg, startedAt: runStartRef.current }))
          break
      }
    })
    const unsubscribe = subscribeProblem(id)
    return () => {
      off()
      unsubscribe()
    }
  }, [id, load])

  const started = !!detail?.started
  useEffect(() => {
    if (started) term.current?.reset(termText.current)
  }, [started])

  const act = async (fn: () => Promise<{ detail: Detail; warning?: string } | void>) => {
    setBusy(true)
    try {
      const res = await fn()
      if (res) {
        setDetail(res.detail)
        setWarning(res.warning ?? '')
      }
    } catch (e) {
      setWarning(String(e))
    } finally {
      setBusy(false)
    }
  }

  if (error) return <p className="page error">{error}</p>
  if (!detail) return <p className="page muted">Loading…</p>

  const { entry } = detail
  const isAoc = detail.kind === 'aoc'
  const dataSet = entry.dataSet ?? 'input'
  const dataSets = ['input', ...detail.testSets.map(t => t.id)]
  const parts = isAoc ? ['Part 1', 'Part 2'] : ['Answer']
  const enabledParts = isAoc ? (entry.parts ?? [true, true]) : [true]
  // Turning off the only enabled part switches to the other one, so something always runs.
  const togglePart = (i: number) => {
    const next: [boolean, boolean] = [enabledParts[0], enabledParts[1]]
    next[i] = !next[i]
    if (!next[0] && !next[1]) next[1 - i] = true
    return act(() => api.update(id, { parts: next }))
  }
  const storedAnswers = isAoc ? (entry.answers ?? [null, null]) : [entry.answer ?? null]

  const selectDataSet = (value: string) => act(() => api.update(id, { dataSet: value }))

  return (
    <div className="page problem">
      <header className="topbar">
        <Link to="/">← All problems</Link>
        <div className="topbar-right">
          <GitStatus />
          <nav className="prev-next">
            {detail.prev && <Link to={problemPath(detail.prev)}>‹ Prev</Link>}
            {detail.next && <Link to={problemPath(detail.next)}>Next ›</Link>}
          </nav>
        </div>
      </header>

      <div className="title">
        <span className="muted">{problemLabel(id)}</span>
        <h1>{entry.name ?? '…'}</h1>
      </div>

      <div className="actions">
        <a href={detail.url} target="_blank" rel="noreferrer">
          Puzzle ↗
        </a>
        {isAoc && (
          <a href={`${detail.url}/input`} target="_blank" rel="noreferrer">
            Input ↗
          </a>
        )}
        {detail.started && <button onClick={() => api.openEditor(id)}>Open in VS Code</button>}
        {detail.started &&
          (detail.hasVis ? (
            <>
              <button onClick={() => window.open(`/vis.html?id=${encodeURIComponent(id)}`, '_blank')}>
                Launch Visualization
              </button>
              <button className="link" onClick={() => api.openEditor(id, 'vis')}>
                edit vis.ts
              </button>
            </>
          ) : (
            <button onClick={() => act(() => api.createVis(id))}>Generate Visualization File</button>
          ))}
      </div>

      {entry.issue && (
        <div className="issue">
          <div>
            <strong>⚠ Known issue</strong>
            <p>{entry.issue}</p>
          </div>
          <button disabled={busy} onClick={() => act(() => api.update(id, { issue: null }))}>
            Mark resolved
          </button>
        </div>
      )}

      {warning && (
        <p className="banner">
          {warning}
          <button className="icon" onClick={() => setWarning('')} aria-label="Dismiss">
            ✕
          </button>
        </p>
      )}

      {!detail.started ? (
        <div className="start">
          <p className="muted">Not started yet.</p>
          <button className="primary" disabled={busy} onClick={() => act(() => api.start(id))}>
            {busy ? 'Starting…' : 'Start'}
          </button>
        </div>
      ) : (
        <>
          <div className="status-row">
            {parts.map((label, i) => {
              const on = isAoc ? !!entry.stars?.[i] : !!entry.solved
              const toggle = () =>
                act(() => {
                  if (!isAoc) return api.update(id, { solved: !on })
                  const stars = [...(entry.stars ?? [false, false])]
                  stars[i] = !on
                  return api.update(id, { stars })
                })
              return (
                <div key={label} className="status-item">
                  <button className={`toggle ${on ? 'on' : ''}`} disabled={busy} onClick={toggle}>
                    {isAoc ? `★ ${label}` : on ? '✓ Solved' : 'Mark solved'}
                  </button>
                  <AnswerField
                    value={storedAnswers[i]}
                    onSave={value =>
                      act(() => {
                        if (!isAoc) return api.update(id, { answer: value })
                        const answers = [...storedAnswers]
                        answers[i] = value
                        return api.update(id, { answers })
                      })
                    }
                  />
                </div>
              )
            })}
            {(isAoc ? entry.stars?.some(Boolean) : entry.solved) && (
              <button className="link" disabled={busy} onClick={() => act(() => api.fetchAnswers(id))}>
                re-fetch answers
              </button>
            )}
          </div>

          {isAoc && !detail.hasInput && (
            <p className="banner">
              No puzzle input yet.
              <button disabled={busy} onClick={() => act(() => api.fetchInput(id))}>
                Fetch input
              </button>
            </p>
          )}

          <div className="run-bar">
            {isAoc && (
              <div className="segmented">
                {parts.map((label, i) => (
                  <button
                    key={label}
                    className={enabledParts[i] ? 'active' : ''}
                    aria-pressed={enabledParts[i]}
                    onClick={() => togglePart(i)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <div className="segmented">
              {dataSets.map(ds => (
                <button
                  key={ds}
                  className={ds === dataSet ? 'active' : ''}
                  onClick={() => ds !== dataSet && selectDataSet(ds)}
                >
                  {dataSetLabel(detail, ds)}
                </button>
              ))}
            </div>
            <button onClick={() => setDrawerOpen(true)}>Test Data</button>
            <span className="spacer" />
            {run?.status === 'running' ? (
              <button onClick={() => api.stop(id)}>■ Stop</button>
            ) : (
              <button onClick={() => api.run(id)}>▶ Run</button>
            )}
          </div>

          <div className="results">
            {parts.map((label, i) => {
              if (!enabledParts[i]) return null
              const result = run?.results.find(r => r.part === i)
              const expected = storedAnswers[i]
              const checkable = run?.dataSet === 'input' && expected != null && result?.value != null
              const correct = checkable && result!.value === expected
              return (
                <div key={label} className="result">
                  <span className="result-label">{label}</span>
                  <code className="result-value">
                    {result ? (result.error ? <span className="error">error</span> : (result.value ?? 'null')) : run?.status === 'running' ? '…' : '—'}
                  </code>
                  {checkable && (
                    <span className={correct ? 'check ok' : 'check bad'} title={`Accepted answer: ${expected}`}>
                      {correct ? '✓' : '✗'}
                    </span>
                  )}
                  {result && <span className="muted result-ms">{formatMs(result.ms)}</span>}
                  {result?.value != null && (
                    <button onClick={() => navigator.clipboard.writeText(result.value!)}>Copy</button>
                  )}
                </div>
              )
            })}
          </div>

          <Terminal ref={term} />

          <TestDrawer
            detail={detail}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            onDetail={setDetail}
            onSelect={selectDataSet}
          />
        </>
      )}
    </div>
  )
}

function AnswerField({ value, onSave }: { value: string | null; onSave: (v: string | null) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  if (editing) {
    const save = () => {
      setEditing(false)
      if (draft.trim() !== (value ?? '')) onSave(draft.trim() || null)
    }
    return (
      <input
        className="answer-input"
        autoFocus
        value={draft}
        placeholder="answer"
        onChange={e => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={e => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') setEditing(false)
        }}
      />
    )
  }
  return (
    <button
      className="answer link"
      title="Edit accepted answer"
      onClick={() => {
        setDraft(value ?? '')
        setEditing(true)
      }}
    >
      {value != null ? <code>{value}</code> : <span className="muted">no answer</span>} ✎
    </button>
  )
}

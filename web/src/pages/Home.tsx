import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, onMessage } from '../api'
import { problemPath } from '../routes'
import type { Entry, Overview } from '../types'

const aocId = (year: number, day: number) => `aoc/${year}/${String(day).padStart(2, '0')}`
const eulerId = (n: number) => `euler/${String(n).padStart(3, '0')}`

function useExpanded() {
  const read = () => {
    try {
      return new Set<string>(JSON.parse(localStorage.getItem('expanded') ?? '[]'))
    } catch {
      return new Set<string>()
    }
  }
  const [expanded, setExpanded] = useState(read)
  const toggle = (key: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      try {
        localStorage.setItem('expanded', JSON.stringify([...next]))
      } catch {}
      return next
    })
  return [expanded, toggle] as const
}

type CellState = 'locked' | 'none' | 'started' | 'one' | 'two' | 'solved'

function cellState(kind: 'aoc' | 'euler', entry: Entry | undefined, started: boolean): CellState {
  if (kind === 'aoc') {
    const stars = (entry?.stars ?? []).filter(Boolean).length
    if (stars === 2) return 'two'
    if (stars === 1) return 'one'
  } else if (entry?.solved) return 'solved'
  return started ? 'started' : 'none'
}

function IssueCount({ ids, problems }: { ids: string[]; problems: Overview['problems'] }) {
  const n = ids.filter(id => problems[id]?.issue).length
  return n ? <span className="issue-count">⚠ {n}</span> : null
}

const stateLabel: Record<CellState, string> = {
  locked: 'Locked',
  none: 'Not started',
  started: 'Started',
  one: '★',
  two: '★★',
  solved: 'Solved',
}

function Cell(props: { id: string; n: number; state: CellState; name?: string; issue?: string }) {
  const { id, n, state, name, issue } = props
  const title = `${n}${name ? `: ${name}` : ''} — ${stateLabel[state]}${issue ? `\n⚠ ${issue}` : ''}`
  if (state === 'locked') return <span className="cell locked" title={title}>{n}</span>
  return (
    <Link to={problemPath(id)} className={`cell ${state} ${issue ? 'has-issue' : ''}`} title={title}>
      {issue && <span className="cell-issue" aria-label="Has issue" />}
      <span>{n}</span>
      {state === 'one' && <span className="cell-stars">★</span>}
      {state === 'two' && <span className="cell-stars">★★</span>}
    </Link>
  )
}

function Group(props: {
  label: string
  summary: React.ReactNode
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <section className={`group ${props.open ? 'open' : ''}`}>
      <button className="group-header" onClick={props.onToggle} aria-expanded={props.open}>
        <span className="chevron">{props.open ? '▾' : '▸'}</span>
        <span className="group-label">{props.label}</span>
        <span className="group-summary">{props.summary}</span>
      </button>
      {props.open && <div className="grid">{props.children}</div>}
    </section>
  )
}

export function Home() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [error, setError] = useState('')
  const [expanded, toggle] = useExpanded()

  const load = useCallback(
    () =>
      api.overview().then(
        o => {
          setOverview(o)
          setError('')
        },
        e => setError((e as Error).message),
      ),
    [],
  )
  useEffect(() => {
    void load()
    return onMessage(msg => (msg.type === 'progress' || msg.type === 'connected') && void load())
  }, [load])

  // Fetch names for any expanded year that has unlocked days without one.
  useEffect(() => {
    if (!overview) return
    for (const { year, unlocked } of overview.years) {
      if (!expanded.has(`aoc-${year}`)) continue
      const missing = Array.from({ length: unlocked }, (_, i) => aocId(year, i + 1)).some(
        id => !overview.problems[id]?.name,
      )
      if (missing) void api.fetchYearNames(year)
    }
  }, [overview?.years, expanded]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <p className="page error">{error}</p>
  if (!overview) return <p className="page muted">Loading…</p>

  const started = new Set(overview.started)
  const { problems } = overview
  const eulerBlocks = Math.ceil(overview.eulerCount / 100)

  return (
    <div className="page home">
      <header className="topbar">
        <h1>code-challenge</h1>
        <Link to="/settings">Settings</Link>
      </header>
      {!overview.settings.hasAocSession && (
        <p className="banner">
          No Advent of Code session cookie set: inputs can't be fetched. <Link to="/settings">Add it</Link>
        </p>
      )}

      <h2>Advent of Code</h2>
      {overview.years.map(({ year, days, unlocked }) => {
        const ids = Array.from({ length: days }, (_, i) => aocId(year, i + 1))
        const stars = ids.reduce((sum, id) => sum + (problems[id]?.stars ?? []).filter(Boolean).length, 0)
        const complete = ids.filter(id => problems[id]?.stars?.every(Boolean)).length
        return (
          <Group
            key={year}
            label={String(year)}
            open={expanded.has(`aoc-${year}`)}
            onToggle={() => toggle(`aoc-${year}`)}
            summary={
              <>
                {complete} / {days} <span className="gold">{stars}★</span> <IssueCount ids={ids} problems={problems} />
              </>
            }
          >
            {ids.map((id, i) => (
              <Cell
                key={id}
                id={id}
                n={i + 1}
                name={problems[id]?.name}
                issue={problems[id]?.issue}
                state={i < unlocked ? cellState('aoc', problems[id], started.has(id)) : 'locked'}
              />
            ))}
          </Group>
        )
      })}

      <h2>Project Euler</h2>
      {overview.eulerCount === 0 && <p className="muted">Loading the problem list…</p>}
      {Array.from({ length: eulerBlocks }, (_, b) => {
        const first = b * 100 + 1
        const last = Math.min(first + 99, overview.eulerCount)
        const numbers = Array.from({ length: last - first + 1 }, (_, i) => first + i)
        const solved = numbers.filter(n => problems[eulerId(n)]?.solved).length
        return (
          <Group
            key={b}
            label={`${first}–${last}`}
            open={expanded.has(`euler-${b}`)}
            onToggle={() => toggle(`euler-${b}`)}
            summary={
              <>
                {solved} / {numbers.length} <IssueCount ids={numbers.map(eulerId)} problems={problems} />
              </>
            }
          >
            {numbers.map(n => {
              const id = eulerId(n)
              return (
                <Cell
                  key={id}
                  id={id}
                  n={n}
                  name={problems[id]?.name}
                  issue={problems[id]?.issue}
                  state={cellState('euler', problems[id], started.has(id))}
                />
              )
            })}
          </Group>
        )
      })}
    </div>
  )
}

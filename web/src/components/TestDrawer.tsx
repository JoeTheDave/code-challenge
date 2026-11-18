import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import type { Detail } from '../types'

interface Props {
  detail: Detail
  open: boolean
  onClose: () => void
  onDetail: (d: Detail) => void
  onSelect: (dataSet: string) => void
}

type Draft = { name: string; content: string }

export function TestDrawer({ detail, open, onClose, onDetail, onSelect }: Props) {
  // Local drafts so typing isn't clobbered by server round-trips; synced in by id.
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    setDrafts(prev => {
      const next: Record<string, Draft> = {}
      for (const t of detail.testSets) next[t.id] = prev[t.id] ?? { name: t.name, content: t.content }
      return next
    })
  }, [detail.testSets])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const edit = (testId: string, field: keyof Draft, value: string) => {
    setDrafts(prev => ({ ...prev, [testId]: { ...prev[testId], [field]: value } }))
    const key = `${testId}:${field}`
    clearTimeout(timers.current[key])
    timers.current[key] = setTimeout(() => void api.saveTest(detail.id, testId, { [field]: value }), 400)
  }

  const add = async () => onDetail((await api.addTest(detail.id)).detail)
  const remove = async (testId: string, name: string) => {
    if (!confirm(`Delete test set "${name}"?`)) return
    onDetail((await api.deleteTest(detail.id, testId)).detail)
  }

  const selected = detail.entry.dataSet ?? 'input'

  return (
    <>
      <div className={`drawer-backdrop ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <header className="drawer-header">
          <h2>Test Data</h2>
          <button className="icon" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="drawer-body">
          {detail.testSets.map(t => {
            const draft = drafts[t.id] ?? { name: t.name, content: t.content }
            return (
              <div key={t.id} className={`test-set ${selected === t.id ? 'selected' : ''}`}>
                <div className="test-set-header">
                  <input
                    className="test-name"
                    value={draft.name}
                    onChange={e => edit(t.id, 'name', e.target.value)}
                  />
                  {selected === t.id ? (
                    <span className="pill">In use</span>
                  ) : (
                    <button onClick={() => onSelect(t.id)}>Use</button>
                  )}
                  <button className="danger" onClick={() => remove(t.id, draft.name)}>
                    Delete
                  </button>
                </div>
                <textarea
                  value={draft.content}
                  spellCheck={false}
                  placeholder="Paste example input here"
                  onChange={e => edit(t.id, 'content', e.target.value)}
                />
              </div>
            )
          })}
          <button className="add-test" onClick={add}>
            + Add test set
          </button>
        </div>
      </aside>
    </>
  )
}

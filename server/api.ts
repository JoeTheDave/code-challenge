import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import express, { type Request, type Response } from 'express'
import { getEntry, getProgress, updateEntry, updateMeta, type Entry } from './progress.ts'
import {
  aocId,
  aocYears,
  daysInYear,
  eulerId,
  inputFile,
  isStarted,
  parseId,
  problemDir,
  puzzleUrl,
  solutionFile,
  startedIds,
  testFile,
  visFile,
  type Problem,
} from './problems.ts'
import { getRun, run, stop, dataSetFile } from './runner.ts'
import { solutionTemplate, visTemplate } from './scaffold.ts'
import { publicSettings, updateSettings } from './settings.ts'
import {
  SiteError,
  fetchAocAnswers,
  fetchAocInput,
  fetchAocName,
  fetchEulerAnswer,
  fetchEulerNames,
} from './sites.ts'
import { rootDir } from './paths.ts'
import { GitOpError, commitAll, fetchOnFocus, fetchRemote, getGitStatus, pull, push } from './git.ts'

export const api = express.Router()
api.use(express.json({ limit: '10mb' }))

// ---- Git sync status ----------------------------------------------------------

api.get('/git', (_req, res) => {
  res.json(getGitStatus())
})

/** `{ force: true }` fetches now; otherwise only if the last fetch is over a minute old. */
api.post('/git/fetch', async (req, res) => {
  await (req.body?.force ? fetchRemote() : fetchOnFocus())
  res.json(getGitStatus())
})

async function gitAction(res: Response, action: () => Promise<void>) {
  try {
    await action()
    res.json(getGitStatus())
  } catch (e) {
    res.status(e instanceof GitOpError ? 409 : 500).json({ error: (e as Error).message })
  }
}

api.post('/git/commit', (req, res) => gitAction(res, () => commitAll(String(req.body?.message ?? ''))))
api.post('/git/push', (_req, res) => gitAction(res, push))
api.post('/git/pull', (_req, res) => gitAction(res, pull))

// ---- Names ------------------------------------------------------------------

const fetchingYears = new Set<number>()

async function fetchYearNames(year: number) {
  if (fetchingYears.has(year)) return
  fetchingYears.add(year)
  try {
    const unlocked = aocYears().find(y => y.year === year)?.unlocked ?? 0
    for (let day = 1; day <= unlocked; day++) {
      const id = aocId(year, day)
      if (getEntry(id).name) continue
      try {
        updateEntry(id, { name: await fetchAocName(year, day) })
      } catch (e) {
        console.warn(String(e))
      }
    }
  } finally {
    fetchingYears.delete(year)
  }
}

let fetchingEuler: Promise<void> | null = null

function refreshEulerNames(force = false) {
  const last = getProgress().meta.eulerNamesFetchedAt
  if (!force && last && Date.now() - Date.parse(last) < 24 * 60 * 60 * 1000) return Promise.resolve()
  fetchingEuler ??= fetchEulerNames()
    .then(names => {
      for (const [number, name] of names) {
        const id = eulerId(number)
        if (getEntry(id).name !== name) updateEntry(id, { name })
      }
      updateMeta({ eulerCount: Math.max(...names.keys()), eulerNamesFetchedAt: new Date().toISOString() })
    })
    .catch(e => console.warn(String(e)))
    .finally(() => (fetchingEuler = null))
  return fetchingEuler
}

function ensureName(p: Problem) {
  if (getEntry(p.id).name) return
  if (p.kind === 'euler') void refreshEulerNames(true)
  else
    fetchAocName(p.year, p.day)
      .then(name => updateEntry(p.id, { name }))
      .catch(e => console.warn(String(e)))
}

// ---- Helpers ----------------------------------------------------------------

function problemFrom(req: Request, res: Response): Problem | null {
  const p = parseId(String(req.params.id))
  if (!p) res.status(404).json({ error: 'Unknown problem' })
  return p
}

const warningOf = (e: unknown) => {
  if (e instanceof SiteError) return e.message
  throw e
}

function readTestSets(id: string, entry: Entry) {
  return (entry.testSets ?? []).map(t => ({
    ...t,
    content: existsSync(testFile(id, t.id)) ? readFileSync(testFile(id, t.id), 'utf8') : '',
  }))
}

function neighbors(p: Problem) {
  if (p.kind === 'aoc') {
    const prev = p.day > 1 ? aocId(p.year, p.day - 1) : null
    const next = p.day < daysInYear(p.year) ? aocId(p.year, p.day + 1) : null
    return { prev, next }
  }
  return { prev: p.number > 1 ? eulerId(p.number - 1) : null, next: eulerId(p.number + 1) }
}

function detail(p: Problem) {
  const entry = getEntry(p.id)
  return {
    ...p,
    entry,
    url: puzzleUrl(p),
    started: isStarted(p.id),
    hasInput: existsSync(inputFile(p.id)),
    hasVis: existsSync(visFile(p.id)),
    visPath: visFile(p.id),
    testSets: readTestSets(p.id, entry),
    run: getRun(p.id),
    ...neighbors(p),
  }
}

/** Scrape the accepted answer(s) after a star / solved toggle. Returns a warning, if any. */
async function fetchAnswers(p: Problem, parts: number[]): Promise<string | undefined> {
  try {
    // An accepted answer on the site means the part is solved, so credit it too (never un-credit).
    if (p.kind === 'euler') {
      updateEntry(p.id, { answer: await fetchEulerAnswer(p.number), solved: true })
      return
    }
    const { answers: found, bothComplete } = await fetchAocAnswers(p.year, p.day)
    const entry = getEntry(p.id)
    const answers = [...(entry.answers ?? [null, null])] as [string | null, string | null]
    const stars = [...(entry.stars ?? [false, false])] as [boolean, boolean]
    found.forEach((a, i) => {
      answers[i] = a
      stars[i] = true
    })
    if (bothComplete) stars.fill(true)
    updateEntry(p.id, { answers, stars })
    // The last day's second star has no puzzle, so it never has an answer.
    const isFreeStar = (i: number) => i === 1 && p.day === daysInYear(p.year)
    if (!found.length && !bothComplete) return "Advent of Code doesn't show an accepted answer for this puzzle yet."
    const missing = parts.filter(i => !found[i] && !isFreeStar(i))
    if (missing.length) {
      return `Advent of Code doesn't show an answer for part ${missing.map(i => i + 1).join(' & ')} yet.`
    }
  } catch (e) {
    return warningOf(e)
  }
}

// ---- Routes -----------------------------------------------------------------

api.get('/overview', (_req, res) => {
  void refreshEulerNames()
  res.json({
    years: aocYears(),
    eulerCount: getProgress().meta.eulerCount ?? 0,
    problems: getProgress().problems,
    started: startedIds(),
    settings: publicSettings(),
  })
})

api.post('/aoc/:year/names', (req, res) => {
  void fetchYearNames(Number(req.params.year))
  res.json({ ok: true })
})

api.get('/problems/:id', (req, res) => {
  const p = problemFrom(req, res)
  if (!p) return
  ensureName(p)
  res.json(detail(p))
})

api.post('/problems/:id/start', async (req, res) => {
  const p = problemFrom(req, res)
  if (!p) return
  if (isStarted(p.id)) return res.json({ detail: detail(p) })

  let warning: string | undefined
  if (!getEntry(p.id).name) {
    try {
      if (p.kind === 'aoc') updateEntry(p.id, { name: await fetchAocName(p.year, p.day) })
      else await refreshEulerNames(true)
    } catch (e) {
      warning = warningOf(e)
    }
  }
  mkdirSync(problemDir(p.id), { recursive: true })
  if (p.kind === 'aoc') {
    try {
      writeFileSync(inputFile(p.id), await fetchAocInput(p.year, p.day))
    } catch (e) {
      warning = warningOf(e)
    }
  }
  writeFileSync(testFile(p.id, 'test-1'), '')
  updateEntry(p.id, { dataSet: 'input', testSets: [{ id: 'test-1', name: 'Test 1' }] })
  // Written last: the watcher sees index.ts appear and starts the first run.
  writeFileSync(solutionFile(p.id), solutionTemplate(p, getEntry(p.id).name))
  res.json({ detail: detail(p), warning })
})

api.patch('/problems/:id', async (req, res) => {
  const p = problemFrom(req, res)
  if (!p) return
  const before = getEntry(p.id)
  const { stars, solved, dataSet, answers, answer, parts } = req.body as Entry
  const { issue } = req.body as { issue?: string | null }
  const patch: Partial<Entry> = {}
  if (stars) patch.stars = stars
  if (solved !== undefined) patch.solved = solved
  if (answers) patch.answers = answers
  if (answer !== undefined) patch.answer = answer
  if (dataSet) patch.dataSet = dataSet
  if (parts && parts.length === 2 && parts.some(Boolean)) patch.parts = parts
  // undefined drops the key when progress.json is written.
  if (issue !== undefined) patch.issue = issue?.trim() || undefined
  updateEntry(p.id, patch)

  let warning: string | undefined
  if (stars) {
    const turnedOn = [0, 1].filter(i => stars[i] && !before.stars?.[i])
    if (turnedOn.length) warning = await fetchAnswers(p, turnedOn)
  }
  if (solved && !before.solved) warning = await fetchAnswers(p, [0])
  const partsChanged = patch.parts && String(patch.parts) !== String(before.parts ?? [true, true])
  if ((dataSet && dataSet !== before.dataSet) || partsChanged) run(p.id)
  res.json({ detail: detail(p), warning })
})

api.post('/problems/:id/answers/fetch', async (req, res) => {
  const p = problemFrom(req, res)
  if (!p) return
  const entry = getEntry(p.id)
  const parts = p.kind === 'aoc' ? [0, 1].filter(i => entry.stars?.[i]) : [0]
  const warning = await fetchAnswers(p, parts)
  res.json({ detail: detail(p), warning })
})

api.post('/problems/:id/input/fetch', async (req, res) => {
  const p = problemFrom(req, res)
  if (!p) return
  if (p.kind !== 'aoc') return res.status(400).json({ error: 'Only Advent of Code inputs can be fetched' })
  let warning: string | undefined
  try {
    mkdirSync(problemDir(p.id), { recursive: true })
    writeFileSync(inputFile(p.id), await fetchAocInput(p.year, p.day))
  } catch (e) {
    warning = warningOf(e)
  }
  res.json({ detail: detail(p), warning })
})

api.post('/problems/:id/tests', (req, res) => {
  const p = problemFrom(req, res)
  if (!p) return
  const testSets = getEntry(p.id).testSets ?? []
  const n = Math.max(0, ...testSets.map(t => Number(t.id.replace('test-', '')) || 0)) + 1
  const id = `test-${n}`
  mkdirSync(problemDir(p.id), { recursive: true })
  writeFileSync(testFile(p.id, id), '')
  updateEntry(p.id, { testSets: [...testSets, { id, name: `Test ${n}` }] })
  res.json({ detail: detail(p) })
})

api.put('/problems/:id/tests/:testId', (req, res) => {
  const p = problemFrom(req, res)
  if (!p) return
  const testSets = getEntry(p.id).testSets ?? []
  const testId = String(req.params.testId)
  if (!testSets.some(t => t.id === testId)) return res.status(404).json({ error: 'Unknown test set' })
  const { name, content } = req.body as { name?: string; content?: string }
  if (name !== undefined) updateEntry(p.id, { testSets: testSets.map(t => (t.id === testId ? { ...t, name } : t)) })
  // The watcher re-runs if this is the selected data set.
  if (content !== undefined) writeFileSync(testFile(p.id, testId), content)
  res.json({ ok: true })
})

api.delete('/problems/:id/tests/:testId', (req, res) => {
  const p = problemFrom(req, res)
  if (!p) return
  const entry = getEntry(p.id)
  const testId = String(req.params.testId)
  rmSync(testFile(p.id, testId), { force: true })
  const wasSelected = entry.dataSet === testId
  updateEntry(p.id, {
    testSets: (entry.testSets ?? []).filter(t => t.id !== testId),
    ...(wasSelected ? { dataSet: 'input' } : {}),
  })
  if (wasSelected) run(p.id)
  res.json({ detail: detail(p) })
})

api.post('/problems/:id/vis', (req, res) => {
  const p = problemFrom(req, res)
  if (!p) return
  if (!existsSync(visFile(p.id))) writeFileSync(visFile(p.id), visTemplate)
  res.json({ detail: detail(p) })
})

api.get('/problems/:id/data', (req, res) => {
  const p = problemFrom(req, res)
  if (!p) return
  const file = dataSetFile(p.id)
  res.type('text/plain').send(file ? readFileSync(file, 'utf8').replace(/\r?\n$/, '') : '')
})

api.post('/problems/:id/open', (req, res) => {
  const p = problemFrom(req, res)
  if (!p) return
  const file = req.body?.file === 'vis' ? visFile(p.id) : solutionFile(p.id)
  const child = spawn('code', [rootDir, '-g', file], { detached: true, stdio: 'ignore' })
  child.on('error', () => {
    spawn('open', ['-a', 'Visual Studio Code', rootDir, file], { detached: true, stdio: 'ignore' }).unref()
  })
  child.unref()
  res.json({ ok: true })
})

api.post('/problems/:id/run', (req, res) => {
  const p = problemFrom(req, res)
  if (!p) return
  run(p.id)
  res.json({ ok: true })
})

api.post('/problems/:id/stop', (req, res) => {
  const p = problemFrom(req, res)
  if (!p) return
  stop(p.id)
  res.json({ ok: true })
})

api.get('/settings', (_req, res) => res.json(publicSettings()))

api.put('/settings', (req, res) => {
  const { aocSession, eulerCookie, contact } = req.body as Record<string, string | undefined>
  const patch: Record<string, string> = {}
  // Accept either the bare value or a pasted "session=…" pair.
  if (aocSession !== undefined) patch.aocSession = aocSession.trim().replace(/^session=/, '')
  if (eulerCookie !== undefined) patch.eulerCookie = eulerCookie.trim()
  if (contact !== undefined) patch.contact = contact.trim()
  updateSettings(patch)
  res.json(publicSettings())
})

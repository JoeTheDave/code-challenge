import path from 'node:path'
import { existsSync, readdirSync } from 'node:fs'
import { solutionsDir } from './paths.ts'

export type Problem =
  | { kind: 'aoc'; id: string; year: number; day: number }
  | { kind: 'euler'; id: string; number: number }

export const aocId = (year: number, day: number) => `aoc/${year}/${String(day).padStart(2, '0')}`
export const eulerId = (number: number) => `euler/${String(number).padStart(3, '0')}`

export function parseId(id: string): Problem | null {
  let m = id.match(/^aoc\/(\d{4})\/(\d{2})$/)
  if (m) {
    const year = Number(m[1])
    const day = Number(m[2])
    if (year < 2015 || day < 1 || day > daysInYear(year)) return null
    return { kind: 'aoc', id, year, day }
  }
  m = id.match(/^euler\/(\d{3,})$/)
  if (m && Number(m[1]) > 0) return { kind: 'euler', id, number: Number(m[1]) }
  return null
}

export const problemDir = (id: string) => path.join(solutionsDir, id)
export const solutionFile = (id: string) => path.join(problemDir(id), 'index.ts')
export const visFile = (id: string) => path.join(problemDir(id), 'vis.ts')
export const inputFile = (id: string) => path.join(problemDir(id), 'input.txt')
export const testFile = (id: string, testId: string) => path.join(problemDir(id), `${testId}.txt`)

export const isStarted = (id: string) => existsSync(solutionFile(id))

export const puzzleUrl = (p: Problem) =>
  p.kind === 'aoc' ? `https://adventofcode.com/${p.year}/day/${p.day}` : `https://projecteuler.net/problem=${p.number}`

// AoC went from 25 days to 12 starting in 2025.
export const daysInYear = (year: number) => (year >= 2025 ? 12 : 25)

// Puzzles unlock at midnight US Eastern (UTC-5) on each day of December.
export const unlockTime = (year: number, day: number) => Date.UTC(year, 11, day, 5)

export function aocYears(now = Date.now()) {
  const years = []
  for (let year = 2015; unlockTime(year, 1) <= now; year++) {
    const days = daysInYear(year)
    let unlocked = 0
    while (unlocked < days && unlockTime(year, unlocked + 1) <= now) unlocked++
    years.push({ year, days, unlocked })
  }
  return years.reverse()
}

/** Ids of every problem that has a solution file on disk. */
export function startedIds(): string[] {
  const ids: string[] = []
  const list = (dir: string) => (existsSync(dir) ? readdirSync(dir) : [])
  for (const year of list(path.join(solutionsDir, 'aoc'))) {
    for (const day of list(path.join(solutionsDir, 'aoc', year))) {
      const id = `aoc/${year}/${day}`
      if (parseId(id) && isStarted(id)) ids.push(id)
    }
  }
  for (const num of list(path.join(solutionsDir, 'euler'))) {
    const id = `euler/${num}`
    if (parseId(id) && isStarted(id)) ids.push(id)
  }
  return ids
}

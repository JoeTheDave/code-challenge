import { getSettings } from './settings.ts'

/** Thrown for problems the user should see as a warning (bad cookie, site down, …). */
export class SiteError extends Error {}

const minGapMs = 400
const lastRequest = new Map<string, number>()

async function throttle(host: string) {
  const wait = (lastRequest.get(host) ?? 0) + minGapMs - Date.now()
  lastRequest.set(host, Date.now() + Math.max(wait, 0))
  if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait))
}

async function fetchText(url: string, cookie?: string) {
  const { host } = new URL(url)
  await throttle(host)
  const { contact } = getSettings()
  const headers: Record<string, string> = {
    'User-Agent': `code-challenge local puzzle tracker${contact ? ` (${contact})` : ''}`,
  }
  if (cookie) headers.Cookie = cookie
  let res: Response
  try {
    res = await fetch(url, { headers, redirect: 'manual' })
  } catch (e) {
    throw new SiteError(`Could not reach ${host}: ${(e as Error).message}`)
  }
  return { status: res.status, text: await res.text() }
}

const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
const decode = (s: string) =>
  s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e: string) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)))
    return entities[e] ?? m
  })
const stripTags = (s: string) => decode(s.replace(/<[^>]*>/g, ''))

// ---- Advent of Code ---------------------------------------------------------

const aocSessionCookie = () => {
  const { aocSession } = getSettings()
  if (!aocSession) throw new SiteError('No Advent of Code session cookie set (see Settings).')
  return `session=${aocSession}`
}

export async function fetchAocName(year: number, day: number) {
  const { status, text } = await fetchText(`https://adventofcode.com/${year}/day/${day}`)
  const m = text.match(/<h2>--- Day \d+: (.*?) ---<\/h2>/)
  if (status !== 200 || !m) throw new SiteError(`Could not read the name for AoC ${year} day ${day}.`)
  return decode(m[1])
}

export async function fetchAocInput(year: number, day: number) {
  const { status, text } = await fetchText(
    `https://adventofcode.com/${year}/day/${day}/input`,
    aocSessionCookie(),
  )
  if (status !== 200) {
    throw new SiteError(
      status === 400 || status === 500
        ? 'Advent of Code rejected the session cookie; it may have expired (see Settings).'
        : `Advent of Code returned ${status} for the input: ${text.trim().slice(0, 120)}`,
    )
  }
  return text
}

/** Accepted answers for each solved part, in order. */
export async function fetchAocAnswers(year: number, day: number) {
  const { status, text } = await fetchText(`https://adventofcode.com/${year}/day/${day}`, aocSessionCookie())
  if (status !== 200) throw new SiteError(`Advent of Code returned ${status}.`)
  if (!text.includes('<div class="user">')) {
    throw new SiteError('Not logged in to Advent of Code; the session cookie may have expired (see Settings).')
  }
  return {
    answers: [...text.matchAll(/Your puzzle answer was <code>(.*?)<\/code>/g)].map(m => decode(m[1])),
    // Covers the last day, whose second star has no answer of its own.
    bothComplete: text.includes('Both parts of this puzzle are complete'),
  }
}

// ---- Project Euler ----------------------------------------------------------

const latex: Record<string, string> = { times: '×', pi: 'π', omega: 'ω', equiv: '≡', sqrt: '√', cdot: '·', le: '≤', ge: '≥' }

/** Euler titles contain inline LaTeX and HTML, e.g. "$N$<sup>th</sup> Digit", "$4 \\times N$". */
export const plainTitle = (title: string) =>
  stripTags(title)
    .replace(/\$([^$]*)\$/g, (_, math: string) =>
      math
        .replace(/\\(?:text|mathcal|mathrm)\{([^}]*)\}/g, '$1')
        .replace(/\\sqrt /g, '√')
        .replace(/\\([a-z]+)/gi, (m, cmd: string) => latex[cmd] ?? m)
        .replace(/[{}]/g, ''),
    )

export async function fetchEulerNames() {
  const { status, text } = await fetchText('https://projecteuler.net/minimal=problems')
  if (status !== 200) throw new SiteError(`Project Euler returned ${status} for the problem list.`)
  const names = new Map<number, string>()
  for (const line of text.split('\n').slice(1)) {
    const [id, title] = line.split('##')
    if (Number(id) > 0 && title) names.set(Number(id), plainTitle(title))
  }
  if (names.size === 0) throw new SiteError('Project Euler problem list was empty.')
  return names
}

export async function fetchEulerAnswer(number: number) {
  const { eulerCookie } = getSettings()
  if (!eulerCookie) throw new SiteError('No Project Euler cookie set (see Settings).')
  const { status, text } = await fetchText(`https://projecteuler.net/problem=${number}`, eulerCookie)
  if (status !== 200) throw new SiteError(`Project Euler returned ${status}; the cookie may have expired.`)
  if (!/sign_out|Sign Out|logout/i.test(text)) {
    throw new SiteError('Not logged in to Project Euler; the cookie may have expired (see Settings).')
  }
  // Solved problems show "Answer: <value>" near the top of the page.
  const m = text.match(/Answer:([\s\S]{0,400}?)<\/(?:div|p|form|td)>/i)
  const answer = m && stripTags(m[1]).trim().split(/\s+/)[0]
  if (!answer) throw new SiteError('Could not find an answer on the Project Euler page. Enter it by hand.')
  return answer
}

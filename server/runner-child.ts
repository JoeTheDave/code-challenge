// Runs in a fresh child process for every run: imports the solution, calls each part with the
// selected input, and reports results to the parent over IPC. Console output goes to stdout.
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { inspect } from 'node:util'

const [solutionPath, kind, inputPath] = process.argv.slice(2)

const dim = (s: string) => `\x1b[2m${s}\x1b[0m`
const bold = (s: string) => `\x1b[1;36m${s}\x1b[0m`
const red = (s: string) => `\x1b[31m${s}\x1b[0m`

const send = (msg: object) => new Promise<void>(resolve => process.send!(msg, () => resolve()))

/** Error message plus only the stack frames from the user's code. */
function printError(heading: string, e: unknown) {
  console.error(red(heading))
  if (!(e instanceof Error)) return console.error(e)
  // esbuild syntax errors: the message already says where; its stack is all internals.
  if (e.message.startsWith('Transform failed')) return console.error(e.message.replace(/^Transform failed with \d+ errors?:\n/, ''))
  const frames = (e.stack ?? '')
    .split('\n')
    .slice(1)
    .filter(line => !/runner-child\.ts|node:internal|node_modules/.test(line))
  console.error(`${e.name}: ${e.message}`)
  if (frames.length) console.error(dim(frames.join('\n')))
}

const formatValue = (value: unknown) =>
  typeof value === 'string' ? value : inspect(value, { colors: true, depth: 6 })

const formatMs = (ms: number) => (ms < 1000 ? `${ms.toFixed(2)} ms` : `${(ms / 1000).toFixed(3)} s`)

async function main() {
  const input = inputPath ? readFileSync(inputPath, 'utf8').replace(/\r?\n$/, '') : ''
  const parts = kind === 'aoc' ? ['partOne', 'partTwo'] : ['solve']

  let mod: Record<string, unknown>
  try {
    mod = await import(pathToFileURL(solutionPath).href)
  } catch (e) {
    printError('Failed to load solution:', e)
    return
  }

  for (const [index, name] of parts.entries()) {
    const fn = mod[name]
    if (typeof fn !== 'function') {
      console.log(dim(`${name} is not exported\n`))
      continue
    }
    console.log(bold(`▶ ${name}`))
    const start = performance.now()
    try {
      const value = await fn(input)
      const ms = performance.now() - start
      console.log(`${formatValue(value)}  ${dim(formatMs(ms))}\n`)
      const text = value === undefined || value === null ? null : typeof value === 'object' ? formatPlain(value) : String(value)
      await send({ type: 'result', part: index, value: text, ms })
    } catch (e) {
      const ms = performance.now() - start
      printError(`${name} threw:`, e)
      console.log()
      await send({ type: 'result', part: index, value: null, ms, error: String(e) })
    }
  }
}

const formatPlain = (value: object) => inspect(value, { colors: false, depth: 6, breakLength: Infinity })

// The parent kills us shortly after 'done' in case the solution left timers or handles open.
main().then(() => send({ type: 'done' })).then(() => process.disconnect?.())

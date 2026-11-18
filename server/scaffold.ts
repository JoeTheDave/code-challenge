import type { Problem } from './problems.ts'
import { puzzleUrl } from './problems.ts'

export function solutionTemplate(p: Problem, name: string | undefined) {
  if (p.kind === 'aoc') {
    return `// Advent of Code | ${p.year} | Day ${p.day}${name ? ` | ${name}` : ''}
// ${puzzleUrl(p)}

export const partOne = (input: string) => {
  const lines = input.split('\\n')
  return null
}

export const partTwo = (input: string) => {
  const lines = input.split('\\n')
  return null
}
`
  }
  return `// Project Euler | Problem ${p.number}${name ? ` | ${name}` : ''}
// ${puzzleUrl(p)}

export const solve = (input: string) => {
  return null
}
`
}

export const visTemplate = `// Opened in its own browser tab via "Launch Visualization". Saving this file reloads the tab.
// \`input\` is the problem's currently selected data set.

export const visualize = (canvas: HTMLCanvasElement, input: string) => {
  canvas.width = 800
  canvas.height = 800
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#0f0f23'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#ffff66'
  ctx.font = '20px monospace'
  ctx.fillText(\`\${input.split('\\n').length} lines of input\`, 20, 40)
}
`

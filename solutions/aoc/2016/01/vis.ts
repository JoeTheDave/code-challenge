// Advent of Code | 2016 | Day 1 | No Time for a Taxicab
// Opened in its own browser tab via "Launch Visualization". Saving this file reloads the tab.
// `input` is the problem's currently selected data set; `isTest` is true for test sets.

import { getContext } from '@/lib/vis'

type Point = { x: number; y: number }

// Heading 0 = north, 1 = east, 2 = south, 3 = west. +y is north.
const STEPS = [
  { dx: 0, dy: 1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: -1 },
  { dx: -1, dy: 0 },
]

export const visualize = (canvas: HTMLCanvasElement, input: string, isTest: boolean) => {
  const size = 800
  const pad = 50
  const ctx = getContext(canvas, size, size)

  // Walk the instructions, recording the point after each one.
  const points: Point[] = [{ x: 0, y: 0 }]
  let heading = 0
  input
    .trim()
    .split(', ')
    .forEach(instruction => {
      heading = (heading + (instruction[0] === 'R' ? 1 : 3)) % 4
      const distance = parseInt(instruction.slice(1))
      const last = points[points.length - 1]
      points.push({
        x: last.x + STEPS[heading].dx * distance,
        y: last.y + STEPS[heading].dy * distance,
      })
    })

  // First block visited twice (part two), found by walking one block at a time.
  let firstRevisit: Point | null = null
  const seen = new Set(['0|0'])
  for (let i = 1; i < points.length && !firstRevisit; i++) {
    const a = points[i - 1]
    const b = points[i]
    const dx = Math.sign(b.x - a.x)
    const dy = Math.sign(b.y - a.y)
    const length = Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
    for (let s = 1; s <= length; s++) {
      const p = { x: a.x + dx * s, y: a.y + dy * s }
      const key = `${p.x}|${p.y}`
      if (seen.has(key)) {
        firstRevisit = p
        break
      }
      seen.add(key)
    }
  }
  const revisitIndex = firstRevisit
    ? points.findIndex((_, i) => i > 0 && onSegment(points[i - 1], points[i], firstRevisit!))
    : -1

  // Scale so the whole path (and the origin) fits in the canvas, with the plane centered on it.
  const xs = points.map(p => p.x)
  const ys = points.map(p => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const span = Math.max(maxX - minX, maxY - minY, 1)
  const scale = (size - pad * 2) / span
  const offsetX = pad + ((size - pad * 2) - (maxX - minX) * scale) / 2 - minX * scale
  const offsetY = pad + ((size - pad * 2) - (maxY - minY) * scale) / 2 + maxY * scale
  const toCanvas = (p: Point) => ({ x: offsetX + p.x * scale, y: offsetY - p.y * scale })

  // Pick a grid spacing of 1, 2, 5, 10, 20, 50... that leaves roughly 10-20 lines.
  const gridStep = niceStep(span / 12)

  const drawPlane = () => {
    ctx.fillStyle = '#0f0f23'
    ctx.fillRect(0, 0, size, size)

    const left = Math.floor((-offsetX / scale) / gridStep) * gridStep
    const right = Math.ceil(((size - offsetX) / scale) / gridStep) * gridStep
    const bottom = Math.floor((-(size - offsetY) / scale) / gridStep) * gridStep
    const top = Math.ceil((offsetY / scale) / gridStep) * gridStep

    ctx.font = '11px monospace'
    ctx.lineWidth = 1
    for (let gx = left; gx <= right; gx += gridStep) {
      const cx = offsetX + gx * scale
      ctx.strokeStyle = gx === 0 ? '#666' : '#1f1f3d'
      ctx.beginPath()
      ctx.moveTo(cx, 0)
      ctx.lineTo(cx, size)
      ctx.stroke()
      if (gx !== 0) {
        ctx.fillStyle = '#666'
        ctx.fillText(String(gx), cx + 3, Math.min(Math.max(offsetY + 13, 13), size - 4))
      }
    }
    for (let gy = bottom; gy <= top; gy += gridStep) {
      const cy = offsetY - gy * scale
      ctx.strokeStyle = gy === 0 ? '#666' : '#1f1f3d'
      ctx.beginPath()
      ctx.moveTo(0, cy)
      ctx.lineTo(size, cy)
      ctx.stroke()
      if (gy !== 0) {
        ctx.fillStyle = '#666'
        ctx.fillText(String(gy), Math.min(Math.max(offsetX + 4, 4), size - 30), cy - 3)
      }
    }
  }

  const drawDot = (p: Point, color: string, radius: number) => {
    const c = toCanvas(p)
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(c.x, c.y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawHud = (executed: number) => {
    const here = points[Math.min(executed, points.length - 1)]
    ctx.font = '16px monospace'
    ctx.fillStyle = '#cccccc'
    ctx.fillText(`Instruction ${Math.min(executed, points.length - 1)} / ${points.length - 1}`, 14, 24)
    ctx.fillText(`Position (${here.x}, ${here.y})  Distance ${Math.abs(here.x) + Math.abs(here.y)}`, 14, 46)
  }

  // Each instruction animates for `perInstruction` ms; `elapsed` is the number of instructions
  // (fractional) drawn so far.
  const instructionCount = points.length - 1
  const perInstruction = Math.min(Math.max(8000 / instructionCount, 30), 700)

  const render = (elapsed: number) => {
    const done = Math.floor(elapsed)
    const partial = elapsed - done

    drawPlane()

    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#ffff66'
    ctx.beginPath()
    const start = toCanvas(points[0])
    ctx.moveTo(start.x, start.y)
    for (let i = 1; i <= done && i < points.length; i++) {
      const c = toCanvas(points[i])
      ctx.lineTo(c.x, c.y)
    }
    let head = points[Math.min(done, points.length - 1)]
    if (done < instructionCount) {
      const from = points[done]
      const to = points[done + 1]
      head = { x: from.x + (to.x - from.x) * partial, y: from.y + (to.y - from.y) * partial }
      const c = toCanvas(head)
      ctx.lineTo(c.x, c.y)
    }
    ctx.stroke()

    drawDot(points[0], '#66ff66', 6)
    if (firstRevisit && revisitIndex !== -1 && done >= revisitIndex) {
      drawDot(firstRevisit, '#ff6b6b', 7)
    }
    drawDot(head, '#ffffff', 4)
    drawHud(done)
  }

  const startTime = performance.now()
  const frame = (now: number) => {
    const elapsed = Math.min((now - startTime) / perInstruction, instructionCount)
    render(elapsed)
    if (elapsed < instructionCount) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

// True when p lies on the axis-aligned segment a-b, excluding a itself.
const onSegment = (a: Point, b: Point, p: Point) => {
  const withinX = p.x >= Math.min(a.x, b.x) && p.x <= Math.max(a.x, b.x)
  const withinY = p.y >= Math.min(a.y, b.y) && p.y <= Math.max(a.y, b.y)
  return withinX && withinY && !(p.x === a.x && p.y === a.y)
}

// Round up to the nearest 1, 2, or 5 times a power of ten.
const niceStep = (raw: number) => {
  if (raw <= 1) return 1
  const power = Math.pow(10, Math.floor(Math.log10(raw)))
  const fraction = raw / power
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10
  return nice * power
}

// Advent of Code | 2024 | Day 10 | Hoof It
// https://adventofcode.com/2024/day/10

import { getContext } from '@/lib/vis'
import { Map } from './index'

export const visualize = (canvas: HTMLCanvasElement, input: string) => {
  const rawData = input.split('\n')
  const ctx = getContext(canvas, 1000, 1000)

  const rectSize = 100

  const map = new Map(rawData)
  map.scoreTrailHeads()
  map.nodes.forEach(node => {
    if (node.value === 9) {
      ctx.fillStyle = 'pink'
      ctx.fillRect(node.x * rectSize + 10, node.y * rectSize + 10, rectSize, rectSize)
    }
    if (node.value === 0) {
      ctx.fillStyle = 'lime'
      ctx.fillRect(node.x * rectSize + 10, node.y * rectSize + 10, rectSize, rectSize)
    }
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    ctx.strokeRect(node.x * rectSize + 10, node.y * rectSize + 10, rectSize, rectSize)
    ctx.font = '20px Arial'
    ctx.fillStyle = 'black'
    ctx.fillText(`${node.value}`, node.x * rectSize + 20, node.y * rectSize + 30)
    ctx.font = '14px Arial'
    ctx.fillStyle = 'red'
    ctx.fillText(`${node.canReachSummits.length}`, node.x * rectSize + 20, node.y * rectSize + 50)
  })
}

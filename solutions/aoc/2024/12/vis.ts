// Advent of Code | 2024 | Day 12 | Garden Groups
// https://adventofcode.com/2024/day/12

import { getContext } from '@/lib/vis'
import { Map, wrapGrid } from './index'

export const visualize = (canvas: HTMLCanvasElement, input: string) => {
  const rawData = input.split('\n')
  const ctx = getContext(canvas, 2000, 2000)

  const map = new Map(wrapGrid(rawData))
  const groupId = 4
  const rectSize = 50
  const textSize = Math.min(Math.floor(rectSize * 0.8), 24)
  const groupNodes = map.nodes.filter(n => n.groupId === groupId)
  const groupPerimeterNodes = groupNodes.filter(n =>
    [n.n, n.ne, n.e, n.se, n.s, n.sw, n.w, n.nw].some(nn => nn === null || nn.groupId !== n.groupId),
  )
  map.nodes.forEach(node => {
    if (groupPerimeterNodes.includes(node)) {
      ctx.fillStyle = 'lime'
      ctx.fillRect(node.x * rectSize + 10, node.y * rectSize + 10, rectSize, rectSize)
    }
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    ctx.strokeRect(node.x * rectSize + 10, node.y * rectSize + 10, rectSize, rectSize)
    ctx.font = `${textSize}px Arial`
    ctx.fillStyle = 'black'
    ctx.fillText(
      `${node.value}`,
      node.x * rectSize + Math.floor(textSize * 1.5),
      node.y * rectSize + Math.floor(textSize * 2.25),
    )
  })
}

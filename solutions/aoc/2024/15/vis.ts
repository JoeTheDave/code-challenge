// Advent of Code | 2024 | Day 15 | Warehouse Woes
// https://adventofcode.com/2024/day/15

import { getContext } from '@/lib/vis'
import { Map } from './index'

export const visualize = (canvas: HTMLCanvasElement, input: string) => {
  const rawdata = input.split('\n')
  const canvasSize = 900
  const ctx = getContext(canvas, canvasSize, canvasSize)

  const map = new Map(rawdata)
  map.navigate()

  const cellSize = 20

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvasSize, canvasSize)
  map.nodes.forEach(node => {
    if (node.value === '@') {
      ctx.fillStyle = 'lime'
    } else if (node.value === '#') {
      ctx.fillStyle = 'gray'
    } else if (node.value === 'O') {
      ctx.fillStyle = 'orange'
    } else if (node.value === '.') {
      ctx.fillStyle = 'white'
    }

    ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize)
  })

  // const root = document.getElementById('root') as HTMLElement
  // const button = document.createElement('button')
  // button.innerText = 'Iterate'
  // root.appendChild(button)

  // button.onclick = () => {
  // }
}

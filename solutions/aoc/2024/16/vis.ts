// Advent of Code | 2024 | Day 16 | Reindeer Maze
// https://adventofcode.com/2024/day/16

import { getContext, drawTriangle } from '@/lib/vis'
import { Maze } from './index'

export const visualize = (canvas: HTMLCanvasElement, input: string, isTest: boolean) => {
  const rawData = input.split('\n')
  const cellSize = isTest ? 60 : 6
  const canvasSize = rawData.length * cellSize
  const ctx = getContext(canvas, canvasSize, canvasSize)

  const maze = new Maze(rawData)

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvasSize, canvasSize)

  maze.nodes.forEach(node => {
    if (node.value === 'S') {
      ctx.fillStyle = 'white'
    } else if (node.value === '#') {
      ctx.fillStyle = 'gray'
    } else if (node.value === 'E') {
      ctx.fillStyle = 'green'
    } else if (node.value === '.') {
      ctx.fillStyle = 'white'
    }
    ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize)
  })

  maze.actors.forEach(actor => {
    drawTriangle({
      ctx,
      x: actor.currentNode().x,
      y: actor.currentNode().y,
      color: 'orange',
      direction: 'right',
      size: cellSize,
      sizeMod: 3,
    })
  })

  maze.traverse()

  // const root = document.getElementById('root') as HTMLElement
  // const button = document.createElement('button')
  // button.innerText = 'Iterate'
  // root.appendChild(button)

  // button.onclick = () => {
  // }
}

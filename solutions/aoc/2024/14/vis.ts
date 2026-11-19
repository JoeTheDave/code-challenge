// Advent of Code | 2024 | Day 14 | Restroom Redoubt
// https://adventofcode.com/2024/day/14

import { getContext } from '@/lib/vis'
import { Robot, getRoomSize } from './index'

export const visualize = (canvas: HTMLCanvasElement, input: string, isTest: boolean) => {
  const data = input.split('\n')
  const { roomWidth, roomHeight } = getRoomSize(isTest)
  const canvasSize = 900
  const ctx = getContext(canvas, canvasSize, canvasSize)

  // const root = document.getElementById('root') as HTMLElement
  // const button = document.createElement('button')
  // button.innerText = 'Iterate'
  // root.appendChild(button)

  const robotSize = 8
  const robots = data.map(dataRow => new Robot(dataRow, roomWidth, roomHeight))
  let iteration = 0

  const iterateRobots = () => {
    iteration++
    robots.forEach(robot => robot.move())
  }

  const displayRobots = () => {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvasSize, canvasSize)
    robots.forEach(robot => {
      ctx.fillStyle = 'lime'
      ctx.fillRect(robot.posX * robotSize + 40, robot.posY * robotSize + 40, robotSize, robotSize)
    })
    ctx.font = `${14}px Arial`
    ctx.fillStyle = 'white'
    ctx.fillText(`Iteration: ${iteration}`, 5, 15)
  }

  for (let i = 1; i <= 8280; i++) {
    iterateRobots()
  }
  displayRobots()

  // button.onclick = () => {
  //   for (let i = 1; i <= 101; i++) {
  //     iterateRobots()
  //   }
  //   displayRobots()
  // }

  // setInterval(() => {
  //   for (let i = 1; i <= 101; i++) {
  //     iterateRobots()
  //   }
  //   displayRobots()
  // }, 500)
}

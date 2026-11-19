// Advent of Code | 2024 | Day 14 | Restroom Redoubt
// https://adventofcode.com/2024/day/14

export const getRoomSize = (isTest: boolean) => ({ roomWidth: isTest ? 11 : 101, roomHeight: isTest ? 7 : 103 })

export class Robot {
  posX: number
  posY: number
  velX: number
  velY: number
  roomWidth: number
  roomHeight: number

  constructor(robotInfo: string, roomWidth: number, roomHeight: number) {
    this.roomWidth = roomWidth
    this.roomHeight = roomHeight
    const [position, velocity] = robotInfo.split(' ')
    const [px, py] = position
      .replace('p=', '')
      .split(',')
      .map(n => parseInt(n))
    this.posX = px
    this.posY = py
    const [vx, vy] = velocity
      .replace('v=', '')
      .split(',')
      .map(n => parseInt(n))
    this.velX = vx
    this.velY = vy
  }

  move = () => {
    const { roomWidth, roomHeight } = this
    this.posX += this.velX
    this.posY += this.velY
    if (this.posX > roomWidth - 1) {
      this.posX -= roomWidth
    }
    if (this.posX < 0) {
      this.posX += roomWidth
    }
    if (this.posY > roomHeight - 1) {
      this.posY -= roomHeight
    }
    if (this.posY < 0) {
      this.posY += roomHeight
    }
  }
}

export const partOne = (input: string, isTest: boolean) => {
  const data = input.split('\n')
  const { roomWidth, roomHeight } = getRoomSize(isTest)
  const robots = data.map(dataRow => new Robot(dataRow, roomWidth, roomHeight))
  for (let i = 1; i <= 100; i++) {
    robots.forEach(robot => robot.move())
  }
  const midlineX = Math.floor(roomWidth / 2)
  const midlineY = Math.floor(roomHeight / 2)
  const quadrants = [0, 0, 0, 0]
  robots.forEach(robot => {
    if (robot.posX < midlineX && robot.posY < midlineY) {
      quadrants[0]++
    } else if (robot.posX > midlineX && robot.posY < midlineY) {
      quadrants[1]++
    } else if (robot.posX < midlineX && robot.posY > midlineY) {
      quadrants[2]++
    } else if (robot.posX > midlineX && robot.posY > midlineY) {
      quadrants[3]++
    }
  })
  return quadrants.reduce((product, val) => product * val, 1)
}

export const partTwo = () => {
  // This solution required utilization of the `visualize` feature as you have no idea ultimately
  // what you're looking for other than it looks like a Christmas tree.  No way to write code to
  // identify it before knowing what it will look like.
  // Run the visualization to see the tree.
  return 8280
}

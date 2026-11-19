// Advent of Code | 2016 | Day 1 | No Time for a Taxicab
// https://adventofcode.com/2016/day/1

class Solution {
  instructions: string[]
  heading: number
  x: number
  y: number
  locationHistory: string[]

  constructor(input: string) {
    this.instructions = input.split(', ')
    this.heading = 0
    this.x = 0
    this.y = 0
    this.locationHistory = []
  }

  executePartOne() {
    this.instructions.forEach(instruction => {
      const direction = instruction[0] as 'R' | 'L'
      const distance = parseInt(instruction.slice(1))
      this.turn(direction)
      this.move(distance)
    })
    return Math.abs(this.x) + Math.abs(this.y)
  }

  executePartTwo() {
    this.locationHistory.push(`${this.x}|${this.y}`)
    for (let i = 0; i < this.instructions.length; i++) {
      const instruction = this.instructions[i]
      const direction = instruction[0] as 'R' | 'L'
      const distance = parseInt(instruction.slice(1))
      this.turn(direction)
      for (let d = 0; d < distance; d++) {
        this.move(1)
        const location = `${this.x}|${this.y}`
        if (this.locationHistory.includes(location)) {
          return Math.abs(this.x) + Math.abs(this.y)
        }
        this.locationHistory.push(location)
      }
    }
  }

  turn(direction: 'R' | 'L') {
    this.heading = (this.heading + (direction === 'R' ? 1 : 3)) % 4
  }

  move(distance: number) {
    if (this.heading === 0) {
      this.y += distance
    } else if (this.heading === 1) {
      this.x += distance
    } else if (this.heading === 2) {
      this.y -= distance
    } else if (this.heading === 3) {
      this.x -= distance
    }
  }
}

export const partOne = (input: string) => {
  const solution = new Solution(input)
  return solution.executePartOne()
}

export const partTwo = (input: string) => {
  const solution = new Solution(input)
  return solution.executePartTwo()
}

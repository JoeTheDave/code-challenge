// Advent of Code | 2016 | Day 2 | Bathroom Security
// https://adventofcode.com/2016/day/2

type Direction = 'U' | 'R' | 'D' | 'L'

const isDirection = (char: string): char is Direction => 'URDL'.includes(char)

class Solution {
  instructions: Direction[][]
  keypad: number[][]
  cursor: number[]
  code: number[]

  constructor(input: string) {
    this.instructions = input.split('\n').map(line =>
      line.split('').map(char => {
        if (!isDirection(char)) throw new Error(`Unexpected direction: ${char}`)
        return char
      }),
    )
    this.keypad = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]
    this.cursor = [1, 1]
    this.code = []
  }

  step(direction: Direction) {
    switch (direction) {
      case 'U':
        this.cursor[1] = Math.max(this.cursor[1] - 1, 0)
        break
      case 'D':
        this.cursor[1] = Math.min(this.cursor[1] + 1, 2)
        break
      case 'L':
        this.cursor[0] = Math.max(this.cursor[0] - 1, 0)
        break
      case 'R':
        this.cursor[0] = Math.min(this.cursor[0] + 1, 2)
        break
    }
  }

  execute() {
    this.instructions.forEach(line => {
      line.forEach(direction => {
        this.step(direction)
      })
      this.code.push(this.keypad[this.cursor[1]][this.cursor[0]])
    })
    console.log(this.code)
    return this.code.join('')
  }
}

export const partOne = (input: string) => {
  const solution = new Solution(input)
  return solution.execute()
}

export const partTwo = (input: string) => {
  return null
}

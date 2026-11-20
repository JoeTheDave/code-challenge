// Advent of Code | 2016 | Day 2 | Bathroom Security
// https://adventofcode.com/2016/day/2

type Direction = 'U' | 'R' | 'D' | 'L'

const isDirection = (char: string): char is Direction => 'URDL'.includes(char)

class Solution {
  instructions: Direction[][]
  keypad: Cell[]
  cursor: Cell
  code: string[]

  constructor(input: string, keypad: (string | null)[][]) {
    this.instructions = input.split('\n').map(line =>
      line.split('').map(char => {
        if (!isDirection(char)) throw new Error(`Unexpected direction: ${char}`)
        return char
      }),
    )
    this.keypad = []
    for (let y = 0; y < keypad.length; y++) {
      for (let x = 0; x < keypad[y].length; x++) {
        if (keypad[y][x] !== null) {
          this.keypad.push(new Cell(keypad[y][x] as string))
        }
      }
    }
    for (let y = 0; y < keypad.length; y++) {
      for (let x = 0; x < keypad[y].length; x++) {
        if (keypad[y][x] !== null) {
          const key = this.keypad.find(key => key.value === keypad[y][x]) as Cell
          if (y > 0 && keypad[y - 1][x] !== null) {
            key.U = this.keypad.find(key => key.value === keypad[y - 1][x]) || null
          }
          if (y < keypad.length - 1 && keypad[y + 1][x] !== null) {
            key.D = this.keypad.find(key => key.value === keypad[y + 1][x]) || null
          }
          if (x > 0 && keypad[y][x - 1] !== null) {
            key.L = this.keypad.find(key => key.value === keypad[y][x - 1]) || null
          }
          if (x < keypad[y].length - 1 && keypad[y][x + 1] !== null) {
            key.R = this.keypad.find(key => key.value === keypad[y][x + 1]) || null
          }
        }
      }
    }

    this.cursor = this.keypad.find(key => key.value === '5') as Cell
    this.code = []
  }

  step(direction: Direction) {
    switch (direction) {
      case 'U':
        if (this.cursor.U) {
          this.cursor = this.cursor.U
        }
        break
      case 'D':
        if (this.cursor.D) {
          this.cursor = this.cursor.D
        }
        break
      case 'L':
        if (this.cursor.L) {
          this.cursor = this.cursor.L
        }
        break
      case 'R':
        if (this.cursor.R) {
          this.cursor = this.cursor.R
        }
        break
    }
  }

  execute() {
    this.instructions.forEach(line => {
      line.forEach(direction => {
        this.step(direction)
      })
      this.code.push(this.cursor.value)
    })
    console.log(this.code)
    return this.code.join('')
  }
}

class Cell {
  U: Cell | null
  D: Cell | null
  L: Cell | null
  R: Cell | null
  value: string

  constructor(value: string) {
    this.value = value
    this.U = null
    this.D = null
    this.L = null
    this.R = null
  }
}

export const partOne = (input: string) => {
  const keypad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ]
  const solution = new Solution(input, keypad)
  return solution.execute()
}

export const partTwo = (input: string) => {
  const keypad = [
    [null, null, '1', null, null],
    [null, '2', '3', '4', null],
    ['5', '6', '7', '8', '9'],
    [null, 'A', 'B', 'C', null],
    [null, null, 'D', null, null],
  ]
  const solution = new Solution(input, keypad)
  return solution.execute()
}

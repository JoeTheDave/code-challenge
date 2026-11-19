// Advent of Code | 2023 | Day 3 | Gear Ratios
// https://adventofcode.com/2023/day/3

import { uniq, compact } from 'lodash-es'

const getLineNumbers = (line: string, regEx: RegExp) => {
  const numbers: string[] = line.match(regEx) as string[]

  let result: RegExpExecArray | null = null
  const idxs: number[] = []
  while ((result = regEx.exec(line))) {
    idxs.push(result.index)
  }
  return [numbers, idxs] as [string[], number[]]
}

export const partOne = (input: string) => {
  const data = input.split('\n')
  const lines = data
  let sum = 0
  lines.forEach((line, lineNumber) => {
    const [nums, idxs] = getLineNumbers(line, /\d+/g)
    idxs.forEach((idx, i) => {
      const numLength = `${nums[i]}`.length
      let valid = false
      if (idx !== 0 && line[idx - 1] !== '.') {
        valid = true
      }
      if (idx + numLength < line.length && line[idx + numLength] !== '.') {
        valid = true
      }
      if (lineNumber !== 0) {
        const upLine = lines[lineNumber - 1]
        for (let x = Math.max(idx - 1, 0); x <= Math.min(idx + numLength, line.length - 1); x++) {
          if (upLine[x] !== '.') {
            valid = true
          }
        }
      }
      if (lineNumber !== lines.length - 1) {
        const downlLine = lines[lineNumber + 1]
        for (let x = Math.max(idx - 1, 0); x <= Math.min(idx + numLength, line.length - 1); x++) {
          if (downlLine[x] !== '.') {
            valid = true
          }
        }
      }
      if (valid) {
        sum += parseInt(nums[i])
      }
    })
  })
  return sum
}

export const partTwo = (input: string) => {
  const data = input.split('\n')
  const lines = data
  const getNumberAt = (y: number, x: number) => {
    if (!isNaN(parseInt(lines[y][x]))) {
      let left = x
      let right = x
      while (left >= 0 && /\d/.test(lines[y].charAt(left))) {
        left--
      }
      left++
      while (right < lines[y].length && /\d/.test(lines[y].charAt(right))) {
        right++
      }
      return lines[y].slice(left, right)
    }
  }
  let sum = 0
  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
      if (lines[y][x] === '*') {
        const adjacentNumbers: string[] = []
        for (let b = Math.max(y - 1, 0); b <= Math.min(y + 1, lines.length - 1); b++) {
          for (let a = Math.max(x - 1, 0); a <= Math.min(x + 1, lines[y].length - 1); a++) {
            if (!(b === y && a === x)) {
              adjacentNumbers.push(getNumberAt(b, a) as string)
            }
          }
        }
        const numbers = uniq(compact(adjacentNumbers))
        if (numbers.length === 2) {
          sum += parseInt(numbers[0]) * parseInt(numbers[1])
        }
      }
    }
  }
  return sum
}

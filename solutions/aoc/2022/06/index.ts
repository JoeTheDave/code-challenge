// Advent of Code | 2022 | Day 6 | Tuning Trouble
// https://adventofcode.com/2022/day/6

import { uniq } from 'lodash-es'

export const partOne = (input: string) => {
  const data = input
  let result = 0
  for (let i = 4; i <= data.length; i++) {
    if (uniq(data.slice(i - 4, i)).length === 4) {
      result = i
      break
    }
  }
  return result
}

export const partTwo = (input: string) => {
  const data = input
  let result = 0
  for (let i = 14; i <= data.length; i++) {
    if (uniq(data.slice(i - 14, i)).length === 14) {
      result = i
      break
    }
  }
  return result
}

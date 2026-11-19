// Advent of Code | 2015 | Day 4 | The Ideal Stocking Stuffer
// https://adventofcode.com/2015/day/4

import { createHash } from 'crypto'

const generateMD5Hash = (input: string): string => {
  const hash = createHash('md5')
  hash.update(input)
  return hash.digest('hex')
}

export const partOne = (input: string) => {
  const data = input.split('\n')
  let i = 0
  let exitCondition = false
  do {
    i++
    if (generateMD5Hash(`${data[0]}${i}`).substring(0, 5) === '00000') {
      exitCondition = true
    }
  } while (!exitCondition)
  return i
}

export const partTwo = (input: string) => {
  const data = input.split('\n')
  let i = 0
  let exitCondition = false
  do {
    i++
    if (generateMD5Hash(`${data[0]}${i}`).substring(0, 6) === '000000') {
      exitCondition = true
    }
  } while (!exitCondition)
  return i
}

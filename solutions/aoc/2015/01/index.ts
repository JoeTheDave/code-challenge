// Advent of Code | 2015 | Day 1 | Not Quite Lisp
// https://adventofcode.com/2015/day/1

export const partOne = (input: string) => {
  const data = input.split('\n')
  let floor = 0
  data[0].split('').forEach(c => {
    if (c === '(') {
      floor++
    } else {
      floor--
    }
  })
  return floor
}

export const partTwo = (input: string) => {
  const data = input.split('\n')
  let firstBasementInstruction = 0
  let floor = 0
  data[0].split('').forEach((c, i) => {
    if (c === '(') {
      floor++
    } else {
      floor--
    }
    if (firstBasementInstruction === 0 && floor === -1) {
      firstBasementInstruction = i + 1
    }
  })
  return firstBasementInstruction
}

// Advent of Code | 2022 | Day 4 | Camp Cleanup
// https://adventofcode.com/2022/day/4

import { range, intersection } from 'lodash-es'

const prepareData = (data: string[]) => {
  return data.map(pair => pair.split(',').map(assignment => assignment.split('-').map(section => parseInt(section))))
}

export const partOne = (input: string) => {
  const data = input.split('\n')
  let target = 0
  const pairs = prepareData(data)
  pairs.forEach(pair => {
    const [assignment1, assignment2] = pair

    if (
      (assignment1[0] <= assignment2[0] && assignment1[1] >= assignment2[1]) ||
      (assignment2[0] <= assignment1[0] && assignment2[1] >= assignment1[1])
    ) {
      target++
    }
  })
  return target
}

export const partTwo = (input: string) => {
  const data = input.split('\n')
  const pairs = prepareData(data)
  let target = 0
  pairs.forEach(pair => {
    const [assignment1, assignment2] = pair
    const range1 = range(assignment1[0], assignment1[1] + 1)
    const range2 = range(assignment2[0], assignment2[1] + 1)
    if (intersection(range1, range2).length) {
      target++
    }
  })
  return target
}

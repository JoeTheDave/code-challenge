// Advent of Code | 2017 | Day 10 | Knot Hash
// https://adventofcode.com/2017/day/10

import { range } from 'lodash-es'

const getLengthIndexSelection = (loopSize: number, position: number, segmentSize: number) =>
  range(position, position + segmentSize).map(i => (i >= loopSize ? i - loopSize : i))

export const partOne = (input: string, isTest: boolean) => {
  const data = input.split(',').map(n => parseInt(n))
  const loopSize = isTest ? 5 : 256
  const numberLoop = range(loopSize)
  let position = 0
  let skipSize = 0

  data.forEach(segmentLength => {
    const idxSelection = getLengthIndexSelection(loopSize, position, segmentLength)
    const selection = idxSelection.map(idx => numberLoop[idx])
    selection.reverse()
    idxSelection.forEach((loopIdx, idx) => (numberLoop[loopIdx] = selection[idx]))
    position += segmentLength + skipSize
    position = position % loopSize
    skipSize++
  })

  return numberLoop[0] * numberLoop[1]
}

export const partTwo = (input: string, isTest: boolean) => {
  const data = input.split(',').map(n => parseInt(n))
  const loopSize = isTest ? 5 : 256
  const numberLoop = range(loopSize)
  let position = 0
  let skipSize = 0

  const lenthSuffixValues = [17, 31, 73, 47, 23]
  const segments = [
    ...data
      .join(',')
      .split('')
      .map(char => char.charCodeAt(0)),
    ...lenthSuffixValues,
  ]

  for (let i = 1; i <= 64; i++) {
    segments.forEach(segmentLength => {
      const idxSelection = getLengthIndexSelection(loopSize, position, segmentLength)
      const selection = idxSelection.map(idx => numberLoop[idx])
      selection.reverse()
      idxSelection.forEach((loopIdx, idx) => (numberLoop[loopIdx] = selection[idx]))
      position += segmentLength + skipSize
      position = position % loopSize
      skipSize++
    })
  }

  console.log(numberLoop)

  return null
}

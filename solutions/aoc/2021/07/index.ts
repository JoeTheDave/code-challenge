// Advent of Code | 2021 | Day 7 | The Treachery of Whales
// https://adventofcode.com/2021/day/7

import { range } from 'lodash-es'

export const partOne = (input: string) => {
  const data = input.split(',').map(Number)
  return range(Math.min(...data), Math.max(...data) + 1).reduce((leastFuel, horizontalPosition) => {
    return Math.min(
      leastFuel,
      data.reduce(
        (fuelConsumption, currentPosition) => fuelConsumption + Math.abs(currentPosition - horizontalPosition),
        0,
      ),
    )
  }, Number.MAX_SAFE_INTEGER)
}

export const partTwo = (input: string) => {
  const data = input.split(',').map(Number)
  return range(Math.min(...data), Math.max(...data) + 1).reduce((leastFuel, horizontalPosition) => {
    return Math.min(
      leastFuel,
      data.reduce(
        (fuelConsumption, currentPosition) =>
          fuelConsumption +
          range(1, Math.abs(currentPosition - horizontalPosition) + 1).reduce((fuelSum, step) => fuelSum + step, 0),
        0,
      ),
    )
  }, Number.MAX_SAFE_INTEGER)
}

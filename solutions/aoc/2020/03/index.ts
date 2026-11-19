// Advent of Code | 2020 | Day 3 | Toboggan Trajectory
// https://adventofcode.com/2020/day/3

const treeEncountersFromSlope = (data: string[], slope: number[]) => {
  let encounters = 0
  const [rise, run] = slope
  for (let r = 0; r < data.length / rise; r++) {
    if (data[r * rise][(r * run) % data[r * rise].length] === '#') {
      encounters++
    }
  }
  return encounters
}

export const partOne = (input: string) => {
  const data = input.split('\n')
  return treeEncountersFromSlope(data, [1, 3])
}

export const partTwo = (input: string) => {
  const data = input.split('\n')
  const slopes = [
    [1, 1],
    [1, 3],
    [1, 5],
    [1, 7],
    [2, 1],
  ]
  return slopes.map(slope => treeEncountersFromSlope(data, slope)).reduce((product, val) => product * val, 1)
}

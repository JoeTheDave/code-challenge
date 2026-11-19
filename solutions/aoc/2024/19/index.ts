// Advent of Code | 2024 | Day 19 | Linen Layout
// https://adventofcode.com/2024/day/19

class Evaluator {
  towels: string[]
  patterns: string[]

  constructor(data: string[]) {
    this.towels = data[0].split(', ')
    this.patterns = data.splice(2)
  }

  evaluate = () => {}
}

export const partOne = (input: string) => {
  const rawData = input.split('\n')
  const evaluator = new Evaluator(rawData)
  evaluator.evaluate()

  evaluator.patterns.forEach(pattern => {
    const options = evaluator.towels.filter(towel => pattern.indexOf(towel) === 0)
    console.log(options)
  })

  return null
}

export const partTwo = () => {
  return null
}

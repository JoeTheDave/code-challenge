// Advent of Code | 2019 | Day 1 | The Tyranny of the Rocket Equation
// https://adventofcode.com/2019/day/1

export const partOne = (input: string) => {
  const data = input.split('\n')
  return data.map(d => Math.floor(parseInt(d) / 3) - 2).reduce((sum, num) => sum + num, 0)
}

export const partTwo = (input: string) => {
  const data = input.split('\n')
  return data
    .map(d => {
      const fuel: number[] = []
      do {
        const mass = (fuel.length ? fuel.at(-1) : parseInt(d)) as number
        fuel.push(Math.floor(mass / 3) - 2)
      } while (!fuel.some(f => f <= 0))
      return fuel.filter(f => f > 0).reduce((sum, num) => sum + num, 0)
    })
    .reduce((sum, num) => sum + num, 0)
}

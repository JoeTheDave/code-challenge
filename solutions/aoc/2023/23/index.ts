// Advent of Code | 2023 | Day 23 | A Long Walk
// https://adventofcode.com/2023/day/23

// export class Walker {
//   map: string[]
//   steps: string[]

//   constructor(map: string[], x: number, y: number) {
//     this.map = map
//     this.steps = []
//   }
// }

// export interface Walker {
//   steps: string[]
//   finished: boolean
// }

export const partOne = (input: string) => {
  // const map = input.split('\n')
  // const start = map[0].indexOf('.')
  // const walkers: Walker[] = [{ steps: [`${start}|${0}`], finished: false }]

  // walkers
  //   .filter(w => !w.finished)
  //   .forEach(walker => {
  //     const position = walker.slice(-1)[0]
  //     const possiblePaths: string[] = []
  //     const [x, y] = position.split('|').map(n => parseInt(n))
  //     if (x > 0 && map[y][x - 1] !== '#' && !walker.includes(`${x - 1}|${y}`)) {
  //       possiblePaths.push(`${x - 1}|${y}`)
  //     }
  //     if (
  //       x < map[0].length &&
  //       map[y][x + 1] !== '#' &&
  //       !walker.includes(`${x + 1}|${y}`)
  //     ) {
  //       possiblePaths.push(`${x + 1}|${y}`)
  //     }
  //     if (y > 0 && map[y - 1][x] !== '#' && !walker.includes(`${x}|${y - 1}`)) {
  //       possiblePaths.push(`${x}|${y - 1}`)
  //     }
  //     if (
  //       y < map.length &&
  //       map[y + 1][x] !== '#' &&
  //       !walker.includes(`${x}|${y + 1}`)
  //     ) {
  //       possiblePaths.push(`${x}|${y + 1}`)
  //     }
  //   })

  return null
}

export const partTwo = () => {
  return null
}

// Advent of Code | 2019 | Day 3 | Crossed Wires
// https://adventofcode.com/2019/day/3

import { forEach } from 'lodash-es'

class CircuitConfiguration {
  wires: string[][]
  wireSegments: number[][]

  constructor(wires: string[][]) {
    this.wires = wires
    this.wireSegments = []
    this.plotWires()
  }

  plotWires = () => {
    this.wires.forEach((wire, n) => {
      const cursor: number[] = [0, 0]
      wire.forEach(segmentDefinition => {
        const direction = segmentDefinition[0]
        const magnitude = parseInt(segmentDefinition.slice(1))
        const destination = [...cursor]
        if (direction === 'U') {
          destination[1] += magnitude
        } else if (direction === 'D') {
          destination[1] -= magnitude
        } else if (direction === 'L') {
          destination[0] -= magnitude
        } else if (direction === 'R') {
          destination[0] += magnitude
        }
        this.wireSegments.push([n, ...cursor, ...destination])
        cursor[0] = destination[0]
        cursor[1] = destination[1]
      })
    })
  }

  analyzeWires = () => {
    const wireOne = this.wireSegments.filter(segment => segment[0] === 0)
    const wireTwo = this.wireSegments.filter(segment => segment[0] === 1)
    const intersections = []
    for (let a = 0; a < wireOne.length; a++) {
      for (let b = 0; b < wireTwo.length; b++) {
        const [_1, w1x1, w1y1, w1x2, w1y2] = wireOne[a]
        const [_2, w2x1, w2y1, w2x2, w2y2] = wireTwo[b]

        if (w1x1 === w1x2 && w2y1 === w2y2) {
          // wire 1 is vertical and wire 2 is horizontal
          if ([w1x1, w2x1, w2x2].sort()[1] === w1x1 && [w2y1, w1y1, w1y2].sort()[1] === w2y1) {
            intersections.push([w1x1, w2y1])
          }
        }
        if (w1y1 === w1y2 && w2x1 === w2x2) {
          // wire 1 is horizontal and wire 2 is vertical
          if ([w1y1, w2y1, w2y2].sort()[1] === w1y1 && [w2x1, w1x1, w1x2].sort()[1] === w2x1) {
            intersections.push([w1y1, w2x1])
          }
        }
      }
    }
    return intersections
      .map(i => Math.abs(i[0]) + Math.abs(i[1]))
      .filter(i => i !== 0)
      .sort((a, b) => a - b)[0]
  }
}

export const partOne = (input: string) => {
  const data = input.split('\n').map(l => l.split(','))
  const circuit = new CircuitConfiguration(data)
  return circuit.analyzeWires()
}

export const partTwo = (input: string) => {
  const lines = input.split('\n')
  return null
}

// Advent of Code | 2024 | Day 16 | Reindeer Maze
// https://adventofcode.com/2024/day/16

export class Node {
  value: string
  x: number
  y: number
  id: number
  n: Node | null
  e: Node | null
  s: Node | null
  w: Node | null

  constructor(value: string, x: number, y: number, id: number) {
    this.value = value
    this.x = x
    this.y = y
    this.id = id
    this.n = null
    this.e = null
    this.s = null
    this.w = null
  }
}

export class Actor {
  score: number
  heading: 0 | 90 | 180 | 270
  path: Node[]
  constructor(seed: Node | Actor) {
    if ('value' in seed) {
      this.score = 0
      this.heading = 90
      this.path = [seed]
    } else {
      this.score = seed.score
      this.heading = seed.heading
      this.path = seed.path
    }
  }

  currentNode = () => {
    return this.path[this.path.length - 1]
  }

  possibleNextSteps = () => {
    const node = this.currentNode()
    return [node.n, node.e, node.s, node.w].filter(n => n && n.value === '.' && !this.path.includes(n))
  }
}

export class Maze {
  nodes: Node[]
  actors: Actor[]

  constructor(data: string[]) {
    this.nodes = []
    this.actors = []
    data.forEach((dataRow, idx) => {
      for (let x = 0; x < dataRow.length; x++) {
        this.nodes.push(new Node(dataRow[x], x, idx, dataRow.length * idx + x))
      }
    })
    this.nodes.forEach(node => {
      if (node.y > 0) {
        node.n = this.nodes.find(n => n.y === node.y - 1 && n.x === node.x) as Node
      }
      if (node.x < data[0].length - 1) {
        node.e = this.nodes.find(n => n.y === node.y && n.x === node.x + 1) as Node
      }
      if (node.y < data.length - 1) {
        node.s = this.nodes.find(n => n.y === node.y + 1 && n.x === node.x) as Node
      }
      if (node.x > 0) {
        node.w = this.nodes.find(n => n.y === node.y && n.x === node.x - 1) as Node
      }
    })
    const startNode = this.nodes.find(n => n.value === 'S') as Node
    this.actors.push(new Actor(startNode))
  }

  traverse = () => {
    this.actors.forEach(actor => {
      const nextSteps = actor.possibleNextSteps()
      console.log(nextSteps)
    })
  }
}

export const partOne = (input: string) => {
  const rawData = input.split('\n')
  const maze = new Maze(rawData)
  console.log(maze)
  return null
}

export const partTwo = () => {
  return null
}

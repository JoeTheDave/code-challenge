// Advent of Code | 2017 | Day 5 | A Maze of Twisty Trampolines, All Alike
// https://adventofcode.com/2017/day/5

export const partOne = (input: string) => {
  const data = input.split('\n').map(n => parseInt(n))
  let idx = 0
  let jumps = 0
  const maze = [...data]
  do {
    jumps++
    const jumpTo = idx + maze[idx]
    maze[idx]++
    idx = jumpTo
  } while (idx >= 0 && idx < maze.length)
  return jumps
}

export const partTwo = (input: string) => {
  const data = input.split('\n').map(n => parseInt(n))
  let idx = 0
  let jumps = 0
  const maze = [...data]
  do {
    jumps++
    const jumpTo = idx + maze[idx]
    if (maze[idx] >= 3) {
      maze[idx]--
    } else {
      maze[idx]++
    }
    idx = jumpTo
  } while (idx >= 0 && idx < maze.length)
  return jumps
}

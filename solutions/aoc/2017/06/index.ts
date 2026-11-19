// Advent of Code | 2017 | Day 6 | Memory Reallocation
// https://adventofcode.com/2017/day/6

const getLargestMemoryBank = (data: number[]) => {
  const largestValue = Math.max(...data)
  return data.findIndex(val => val === largestValue)
}

const redistribute = (data: number[], targetIdx: number) => {
  let amount = data[targetIdx]
  data[targetIdx] = 0
  let focusIdx = targetIdx + 1
  for (amount; amount > 0; amount--) {
    if (focusIdx > data.length - 1) {
      focusIdx = 0
    }
    data[focusIdx]++
    focusIdx++
  }
}

export const partOne = (input: string) => {
  const data = input.split(/\s+/).map(n => parseInt(n))
  const memoryStates: { [key: string]: number } = {}
  let exitCondition = false
  let iterations = -1

  do {
    iterations++
    const key = data.join('|')
    if (key in memoryStates) {
      exitCondition = true
    } else {
      memoryStates[key] = iterations
    }
    redistribute(data, getLargestMemoryBank(data))
  } while (!exitCondition)
  return iterations
}

export const partTwo = (input: string) => {
  const data = input.split(/\s+/).map(n => parseInt(n))
  const memoryStates: { [key: string]: number } = {}
  let exitCondition = false
  let iterations = -1
  let loopSize = 0

  do {
    iterations++
    const key = data.join('|')
    if (key in memoryStates) {
      exitCondition = true
      loopSize = iterations - memoryStates[key]
    } else {
      memoryStates[key] = iterations
    }
    redistribute(data, getLargestMemoryBank(data))
  } while (!exitCondition)
  return loopSize
}

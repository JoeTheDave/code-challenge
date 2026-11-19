// Advent of Code | 2015 | Day 17 | No Such Thing as Too Much
// https://adventofcode.com/2015/day/17

export const partOne = (input: string) => {
  const data = input.split('\n').map(v => parseInt(v))
  const maxNum = parseInt('11111111111111111111', 2)
  let combinations = 0
  for (let i = 1; i <= maxNum; i++) {
    const containerTotal = i
      .toString(2)
      .padStart(20, '0')
      .split('')
      .reduce((sum, used, idx) => {
        return sum + (used === '1' ? data[idx] : 0)
      }, 0)
    if (containerTotal === 150) {
      combinations++
    }
  }
  return combinations
}

export const partTwo = (input: string) => {
  const data = input.split('\n').map(v => parseInt(v))
  const maxNum = parseInt('11111111111111111111', 2)
  let containerCount = 20
  let combinations = 0
  for (let i = 1; i <= maxNum; i++) {
    const containerList = i.toString(2).padStart(20, '0').split('')
    const containerTotal = containerList.reduce((sum, used, idx) => {
      return sum + (used === '1' ? data[idx] : 0)
    }, 0)
    if (containerTotal === 150) {
      const containersUsed = containerList.filter(c => c === '1').length
      if (containersUsed < containerCount) {
        containerCount = containersUsed
        combinations = 1
      } else if (containersUsed === containerCount) {
        combinations++
      }
    }
  }
  return combinations
}

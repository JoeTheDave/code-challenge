// Advent of Code | 2017 | Day 2 | Corruption Checksum
// https://adventofcode.com/2017/day/2

export const partOne = (input: string) => {
  const data = input.split('\n')
  return data
    .map(row => row.split(/\s+/).map(char => parseInt(char)))
    .map(row => Math.max(...row) - Math.min(...row))
    .reduce((sum, num) => sum + num, 0)
}

export const partTwo = (input: string) => {
  const data = input.split('\n')
  return data
    .map(row => row.split(/\s+/).map(char => parseInt(char)))
    .map(row => {
      for (let i = 0; i <= row.length - 2; i++) {
        for (let j = i + 1; j <= row.length - 1; j++) {
          if (row[i] % row[j] === 0) {
            return row[i] / row[j]
          }
          if (row[j] % row[i] === 0) {
            return row[j] / row[i]
          }
        }
      }
      return 0
    })
    .reduce((sum, num) => sum + num, 0)
}

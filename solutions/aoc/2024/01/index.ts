// Advent of Code | 2024 | Day 1 | Historian Hysteria
// https://adventofcode.com/2024/day/1

const prepareData = (data: string[]) => {
  return data
    .map(dataRow =>
      dataRow
        .split(' ')
        .filter(v => v !== '')
        .map(n => parseInt(n)),
    )
    .reduce(
      (lists, row) => {
        lists[0].push(row[0])
        lists[1].push(row[1])
        return lists
      },
      [[], []] as number[][],
    )
}

export const partOne = (input: string) => {
  const data = input.split('\n')
  const dataSet = prepareData(data)
  dataSet[0].sort()
  dataSet[1].sort()
  return dataSet[0].map((val, idx) => Math.abs(dataSet[1][idx] - val)).reduce((sum, num) => sum + num, 0)
}

export const partTwo = (input: string) => {
  const data = input.split('\n')
  const dataSet = prepareData(data)
  return dataSet[0].map((val, idx) => val * dataSet[1].filter(v => v === val).length).reduce((sum, num) => sum + num, 0)
}

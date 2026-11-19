// Advent of Code | 2024 | Day 7 | Bridge Repair
// https://adventofcode.com/2024/day/7

const prepareData = (data: string[]) => {
  return data.map(dataRow => {
    const [result, operands] = dataRow.split(': ')
    return { result: parseInt(result), operands: operands.split(' ').map(n => parseInt(n)) }
  })
}

export const partOne = (input: string) => {
  const rawData = input.split('\n')
  const data = prepareData(rawData)
  let sumOfValidResults = 0
  data.forEach(dataSet => {
    const maxNum = 2 ** (dataSet.operands.length - 1) - 1
    for (let i = 0; i <= maxNum; i++) {
      const operatorOptions = i.toString(2).padStart(maxNum.toString(2).length, '0').split('')
      let result = dataSet.operands[0]
      for (let a = 0; a < operatorOptions.length; a++) {
        if (operatorOptions[a] === '0') {
          result += dataSet.operands[a + 1]
        } else {
          result *= dataSet.operands[a + 1]
        }
      }
      if (result === dataSet.result) {
        sumOfValidResults += result
        break
      }
    }
  })
  return sumOfValidResults
}

export const partTwo = (input: string) => {
  const rawData = input.split('\n')
  const data = prepareData(rawData)
  let sumOfValidResults = 0
  data.forEach(dataSet => {
    const maxNum = 3 ** (dataSet.operands.length - 1) - 1
    for (let i = 0; i <= maxNum; i++) {
      const operatorOptions = i.toString(3).padStart(maxNum.toString(3).length, '0').split('')
      let result = dataSet.operands[0]
      for (let a = 0; a < operatorOptions.length; a++) {
        if (operatorOptions[a] === '0') {
          result += dataSet.operands[a + 1]
        } else if (operatorOptions[a] === '1') {
          result *= dataSet.operands[a + 1]
        } else {
          result = parseInt(`${result}${dataSet.operands[a + 1]}`)
        }
      }
      if (result === dataSet.result) {
        sumOfValidResults += result
        break
      }
    }
  })
  return sumOfValidResults
}

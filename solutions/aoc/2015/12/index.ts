// Advent of Code | 2015 | Day 12 | JSAbacusFramework.io
// https://adventofcode.com/2015/day/12

const parseNumbersFromDatastore = (data: any): number => {
  if (typeof data === 'object') {
    return Object.keys(data)
      .map(key => parseNumbersFromDatastore(data[key]))
      .reduce((sum, val) => sum + val, 0)
  } else if (typeof data === 'number') {
    return data
  } else {
    return 0
  }
}

const discriminatelyParseNumbersFromDatastore = (data: any): number => {
  if (typeof data === 'object') {
    if (data.length === undefined && Object.keys(data).some(key => data[key] === 'red')) {
      return 0
    }
    return Object.keys(data)
      .map(key => discriminatelyParseNumbersFromDatastore(data[key]))
      .reduce((sum, val) => sum + val, 0)
  } else if (typeof data === 'number') {
    return data
  } else {
    return 0
  }
}

export const partOne = (input: string) => {
  const data = JSON.parse(input)
  return parseNumbersFromDatastore(data)
}

export const partTwo = (input: string) => {
  const data = JSON.parse(input)
  return discriminatelyParseNumbersFromDatastore(data)
}

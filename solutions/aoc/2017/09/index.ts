// Advent of Code | 2017 | Day 9 | Stream Processing
// https://adventofcode.com/2017/day/9

export const partOne = (input: string) => {
  const data = input.split('\n')
  let dataStream = data[0]

  // Remove cancellations (!)
  while (dataStream.indexOf('!') > -1) {
    dataStream = dataStream.replace(/!./, '')
  }

  // Remove garbage
  while (dataStream.indexOf('<') > -1) {
    const startIdx = dataStream.indexOf('<')
    const endIdx = dataStream.indexOf('>')
    dataStream = dataStream.slice(0, startIdx) + dataStream.slice(endIdx + 1)
  }

  // Remove Commas
  dataStream = dataStream.split(',').join('')

  // Determin Score
  let depth = 0
  let score = 0
  for (let i = 0; i < dataStream.length; i++) {
    const c = dataStream[i]
    if (c === '{') {
      depth++
      score += depth
    } else {
      depth--
    }
  }

  return score
}

export const partTwo = (input: string) => {
  const data = input.split('\n')
  let dataStream = data[0]

  // Remove cancellations (!)
  while (dataStream.indexOf('!') > -1) {
    dataStream = dataStream.replace(/!./, '')
  }

  // Score garbage
  let score = 0
  while (dataStream.indexOf('<') > -1) {
    const startIdx = dataStream.indexOf('<')
    const endIdx = dataStream.indexOf('>')
    dataStream = dataStream.slice(0, startIdx) + dataStream.slice(endIdx + 1)
    score += endIdx - startIdx - 1
  }

  return score
}

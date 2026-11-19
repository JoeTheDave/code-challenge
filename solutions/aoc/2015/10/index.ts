// Advent of Code | 2015 | Day 10 | Elves Look, Elves Say
// https://adventofcode.com/2015/day/10

const evaluateTerm = (term: string) => {
  let currentDigit = ''
  let currentDigitCount = 0
  let newTerm = ''

  const transitionDigit = (digit: string) => {
    if (currentDigit) {
      newTerm += `${currentDigitCount}${currentDigit}`
    }
    currentDigit = digit
    currentDigitCount = 1
  }

  for (let i = 0; i < term.length; i++) {
    if (term[i] !== currentDigit) {
      transitionDigit(term[i])
    } else {
      currentDigitCount++
    }
  }
  transitionDigit('')
  return newTerm
}

export const partOne = (input: string) => {
  const data = input
  let term = data
  for (let i = 0; i < 40; i++) {
    term = evaluateTerm(term)
  }
  return term.length
}

export const partTwo = (input: string) => {
  const data = input
  let term = data
  for (let i = 0; i < 50; i++) {
    term = evaluateTerm(term)
  }
  return term.length
}

// Advent of Code | 2020 | Day 6 | Custom Customs
// https://adventofcode.com/2020/day/6

import { intersection } from 'lodash-es'

export const partOne = (input: string) => {
  const data = input.split('\n')
  let groupAnswers: { [key: string]: boolean } = {}
  let groupScores: number[] = []
  data.forEach(answer => {
    if (answer === '') {
      groupScores.push(Object.keys(groupAnswers).length)
      groupAnswers = {}
    } else {
      answer.split('').forEach(char => (groupAnswers[char] = true))
    }
  })
  groupScores.push(Object.keys(groupAnswers).length)
  return groupScores.reduce((sum, num) => sum + num, 0)
}

export const partTwo = (input: string) => {
  const data = input.split('\n')
  return data
    .map(v => (v === '' ? '|' : `${v},`))
    .join('')
    .slice(0, -1)
    .split(',|')
    .map(group => {
      const answers = group.split(',')
      return answers.reduce(
        (groupAnswers, singleAnswers) => intersection(groupAnswers.split(''), singleAnswers.split('')).join(''),
        answers[0],
      )
    })
    .reduce((sum, answers) => sum + answers.length, 0)
}

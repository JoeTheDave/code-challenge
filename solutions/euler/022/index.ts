// Project Euler | Problem 22 | Names Scores
// https://projecteuler.net/problem=22

import { generateWordScore } from '@/lib/analysis'

export const solve = (input: string) => {
  const rawData = input
  return rawData
    .split(',')
    .sort()
    .map((name, idx) => generateWordScore(name) * (idx + 1))
    .reduce((sum, score) => sum + score, 0)
}

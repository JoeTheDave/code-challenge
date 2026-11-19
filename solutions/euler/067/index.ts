// Project Euler | Problem 67 | Maximum Path Sum II
// https://projecteuler.net/problem=67

import { maximumPyramidPathSum } from '@/lib/algorithms'

export const solve = (input: string) => {
  const rawData = input
  const data = rawData
    .split('\n')
    .map(row => row.split(' ').map(n => parseInt(n)))
  return maximumPyramidPathSum(data)
}

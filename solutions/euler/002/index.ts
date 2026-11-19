// Project Euler | Problem 2 | Even Fibonacci Numbers
// https://projecteuler.net/problem=2

import { getFibonacciSequence } from '@/lib/sequence'

export const solve = () => {
  const fourMillion = 4000000
  const fibonacci = getFibonacciSequence(fourMillion)
  return fibonacci.filter(n => n % 2 === 0).reduce((sum, num) => sum + num, 0)
}

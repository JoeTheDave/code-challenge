// Project Euler | Problem 47 | Distinct Primes Factors
// https://projecteuler.net/problem=47

import { uniq } from 'lodash-es'
import { getPrimeFactors } from '@/lib/primes'

export const solve = () => {
  const targetCount = 4
  let targetNumbers: number[] = []
  let i = 0
  while (targetNumbers.length < targetCount) {
    i++
    const primeFactors = uniq(getPrimeFactors(i))
    if (primeFactors.length === targetCount) {
      targetNumbers.push(i)
    } else {
      targetNumbers = []
    }
  }

  return targetNumbers[0]
}

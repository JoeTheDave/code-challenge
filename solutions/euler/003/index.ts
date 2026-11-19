// Project Euler | Problem 3 | Largest Prime Factor
// https://projecteuler.net/problem=3

import { getPrimeFactors } from '@/lib/primes'

export const solve = () => {
  const product = 600851475143
  const primeFactors = getPrimeFactors(product)
  return Math.max(...primeFactors)
}

// Project Euler | Problem 5 | Smallest Multiple
// https://projecteuler.net/problem=5

import { getPrimeFactors } from '@/lib/primes'

const mergePrimeFactors = (
  accumlatedPrimeFactors: number[],
  newPrimeFactors: number[],
) => {
  const primes = [...accumlatedPrimeFactors]
  const additions: number[] = []
  newPrimeFactors.forEach(f => {
    if (primes.includes(f)) {
      primes.splice(primes.indexOf(f), 1)
    } else {
      additions.push(f)
    }
  })
  return [...accumlatedPrimeFactors, ...additions]
}

export const solve = () => {
  let primeFactors: number[] = []
  for (let n = 20; n >= 2; n--) {
    primeFactors = mergePrimeFactors(primeFactors, getPrimeFactors(n))
  }
  return primeFactors.reduce((product, val) => product * val, 1)
}

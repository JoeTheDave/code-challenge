// Project Euler | Problem 29 | Distinct Powers
// https://projecteuler.net/problem=29

export const solve = () => {
  const results: { [key: string]: boolean } = {}
  for (let a = 2; a <= 100; a++) {
    for (let b = 2; b <= 100; b++) {
      results[`${a ** b}`] = true
    }
  }
  return Object.keys(results).length
}

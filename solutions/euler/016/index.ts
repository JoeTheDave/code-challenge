// Project Euler | Problem 16 | Power Digit Sum
// https://projecteuler.net/problem=16

export const solve = () => {
  return (BigInt(2) ** BigInt(1000))
    .toString()
    .split('')
    .reduce((sum, num) => sum + parseInt(num), 0)
}

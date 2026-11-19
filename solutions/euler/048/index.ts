// Project Euler | Problem 48 | Self Powers
// https://projecteuler.net/problem=48

export const solve = () => {
  let sum = '0'
  for (let i = 1; i <= 1000; i++) {
    sum = (BigInt(sum) + BigInt(i) ** BigInt(i)).toString()
  }
  return sum.substring(sum.length - 10, sum.length)
}

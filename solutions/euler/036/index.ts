// Project Euler | Problem 36 | Double-base Palindromes
// https://projecteuler.net/problem=36

const isPalindromic = (num: string) => {
  return num === num.split('').reverse().join('')
}

export const solve = () => {
  const oneMillion = 1000000
  let sum = 0
  for (let i = 1; i <= oneMillion; i++) {
    if (isPalindromic(`${i}`) && isPalindromic(i.toString(2))) {
      sum += i
    }
  }
  return sum
}

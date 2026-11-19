// Advent of Code | 2017 | Day 1 | Inverse Captcha
// https://adventofcode.com/2017/day/1

export const partOne = (input: string) => {
  const data = input.split('\n')[0]
  let result = 0
  let dataLoop = data + data
  for (let i = 0; i < data.length; i++) {
    if (dataLoop[i] === dataLoop[i + 1]) {
      result += parseInt(data[i])
    }
  }
  return result
}

export const partTwo = (input: string) => {
  const data = input.split('\n')[0]
  let result = 0
  let dataLoop = data + data
  for (let i = 0; i < data.length; i++) {
    if (dataLoop[i] === dataLoop[i + data.length / 2]) {
      result += parseInt(data[i])
    }
  }
  return result
}

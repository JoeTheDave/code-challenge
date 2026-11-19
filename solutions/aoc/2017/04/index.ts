// Advent of Code | 2017 | Day 4 | High-Entropy Passphrases
// https://adventofcode.com/2017/day/4

export const partOne = (input: string) => {
  const data = input.split('\n')
  const evalPasscode = (passcode: string) => {
    const words = passcode.split(' ')
    const dictionary: { [key: string]: number } = {}
    let valid = true
    for (let i = 0; i < words.length; i++) {
      if (dictionary[words[i]] === 1) {
        valid = false
        break
      }
      dictionary[words[i]] = 1
    }
    return valid
  }
  return data.map(passcode => evalPasscode(passcode)).filter(_ => _).length
}

export const partTwo = (input: string) => {
  const data = input.split('\n')
  const evalPasscode = (passcode: string) => {
    const words = passcode.split(' ').map(word => word.split('').sort().join(''))
    const dictionary: { [key: string]: number } = {}
    let valid = true
    for (let i = 0; i < words.length; i++) {
      if (dictionary[words[i]] === 1) {
        valid = false
        break
      }
      dictionary[words[i]] = 1
    }
    return valid
  }
  return data.map(passcode => evalPasscode(passcode)).filter(_ => _).length
}

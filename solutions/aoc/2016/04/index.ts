// Advent of Code | 2016 | Day 4 | Security Through Obscurity
// https://adventofcode.com/2016/day/4

class RoomValidator {
  roomCode: string
  sectorId: string
  checksum: string
  computedChecksum: string
  isValid: boolean

  constructor(roomCode: string) {
    this.roomCode = roomCode

    this.sectorId = roomCode.slice(roomCode.lastIndexOf('-') + 1, roomCode.lastIndexOf('['))
    this.checksum = roomCode.slice(roomCode.lastIndexOf('[') + 1, roomCode.lastIndexOf(']'))

    const letters = roomCode.slice(0, roomCode.lastIndexOf('-')).split('-').join('')
    const letterCounts = letters.split('').reduce<Record<string, number>>((results, letter) => {
      if (results[letter]) {
        results[letter] += 1
      } else {
        results[letter] = 1
      }
      return results
    }, {})
    const sortedLetterKeys = Object.keys(letterCounts).sort((a, b) => {
      return (letterCounts[a] !== letterCounts[b] ? letterCounts[a] < letterCounts[b] : a > b) ? 1 : -1
    })
    this.computedChecksum = sortedLetterKeys.join('').slice(0, 5)
    this.isValid = this.computedChecksum === this.checksum
  }
}

class RoomDecryptor {
  roomCode: string
  sectorId: number
  encoded: string
  decoded: string | null

  private alphabet = 'abcdefghijklmnopqrstuvwxyz'

  constructor(roomCode: string) {
    this.roomCode = roomCode
    this.sectorId = parseInt(roomCode.slice(roomCode.lastIndexOf('-') + 1, roomCode.lastIndexOf('[')))
    this.encoded = roomCode.slice(0, roomCode.lastIndexOf('-'))
    this.decoded = null
  }

  decode() {
    this.decoded = this.encoded
      .split('')
      .map(c => (c === '-' ? ' ' : this.alphabet[(this.alphabet.indexOf(c) + this.sectorId) % 26]))
      .join('')
  }
}

export const partOne = (input: string) => {
  const roomList = input.split('\n').map(roomCode => new RoomValidator(roomCode))
  return roomList.filter(room => room.isValid).reduce((sum, room) => sum + parseInt(room.sectorId), 0)
}

export const partTwo = (input: string) => {
  const roomList = input.split('\n').map(roomCode => new RoomDecryptor(roomCode))
  roomList.forEach(room => room.decode())
  const targetRoom = roomList.find(room => room.decoded?.includes('north'))
  return targetRoom?.sectorId
}

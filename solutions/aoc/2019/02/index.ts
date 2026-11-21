// Advent of Code | 2019 | Day 2 | 1202 Program Alarm
// https://adventofcode.com/2019/day/2

class Computer {
  program: number[]
  cursor: number

  constructor(program: number[]) {
    this.program = program
    this.cursor = 0
  }

  command = () => {
    const [opcode, valOnePosition, valTwoPosition, register] = this.program.slice(
      this.cursor,
      this.cursor + 4,
    )
    const val1 = this.program[valOnePosition]
    const val2 = this.program[valTwoPosition]
    if (opcode !== 99) {
      if (opcode === 1) {
        this.program[register] = val1 + val2
      }
      if (opcode === 2) {
        this.program[register] = val1 * val2
      }
      this.cursor += 4
    }
  }

  execute = () => {
    do {
      this.command()
    } while (this.program[this.cursor] !== 99)
  }
}

export const partOne = (input: string) => {
  const data = input
    .split('\n')[0]
    .split(',')
    .map(n => parseInt(n))
  const programConfiguration = [...data]
  programConfiguration[1] = 12
  programConfiguration[2] = 2
  const computer = new Computer(programConfiguration)
  computer.execute()
  return computer.program[0]
}

export const partTwo = (input: string) => {
  const data = input
    .split('\n')[0]
    .split(',')
    .map(n => parseInt(n))
  for (let noun = 0; noun < 100; noun++) {
    for (let verb = 0; verb < 100; verb++) {
      const programConfiguration = [...data]
      programConfiguration[1] = noun
      programConfiguration[2] = verb
      const computer = new Computer(programConfiguration)
      computer.execute()
      if (computer.program[0] === 19690720) {
        return noun * 100 + verb
      }
    }
  }

  return null
}

// Advent of Code | 2017 | Day 7 | Recursive Circus
// https://adventofcode.com/2017/day/7

interface Program {
  name: string
  weight: number
  supportedBy: Program | null
  supporting: Program[]
  supportingRefList: string[]
  totalWeight: number | null
}

export const generateProgramStack = (data: string[]) => {
  const programStack = data.map(programInfo => {
    const programDetails = programInfo.split(' ')
    const program: Program = {
      name: programDetails[0],
      weight: parseInt(programDetails[1].replace('(', '').replace(')', '')),
      supportedBy: null,
      supporting: [],
      supportingRefList: programInfo.includes('->') ? programInfo.split(' -> ')[1].split(', ') : [],
      totalWeight: null,
    }
    if (program.supportingRefList.length === 0) {
      program.totalWeight = program.weight
    }
    return program
  })
  programStack.forEach(program => {
    if (program.supportingRefList.length) {
      program.supportingRefList.forEach(supportedProgName => {
        const supportedProgram = programStack.find(prog => prog.name === supportedProgName)
        if (supportedProgram) {
          program.supporting.push(supportedProgram)
          supportedProgram.supportedBy = program
        }
      })
    }
  })
  return programStack
}

export const findUniqueChildWeight = (program: Program) => {
  const childWeights = program.supporting.map(prog => prog.totalWeight) as number[]
  const uniqueNumbers = Array.from(new Set(childWeights))
  if (uniqueNumbers.length > 1) {
    return childWeights.filter(n => n === uniqueNumbers[0]).length === 1 ? uniqueNumbers[0] : uniqueNumbers[1]
  }
  return null
}

export const partOne = (input: string) => {
  const data = input.split('\n')
  const programStack = generateProgramStack(data)
  const baseProgram = programStack.find(prog => !prog.supportedBy)
  return baseProgram?.name
}

export const partTwo = (input: string) => {
  const data = input.split('\n')
  const programStack = generateProgramStack(data)

  let slatedForEval: Program[] = []
  let exitCondition = false
  do {
    if (slatedForEval.length === 0) {
      slatedForEval = programStack.filter(
        program => program.totalWeight === null && program.supporting.every(subProg => subProg.totalWeight !== null),
      )
    }
    if (slatedForEval.length === 0) {
      exitCondition = true
    } else {
      const evalTarget = slatedForEval.pop() as Program
      evalTarget.totalWeight = (evalTarget.weight +
        evalTarget.supporting.reduce((sum, prog) => sum + (prog?.totalWeight || 0), 0)) as number
    }
  } while (!exitCondition)

  let focusProgram = programStack.find(prog => !prog.supportedBy) as Program
  let answer = 0
  do {
    const uniqueWeight = findUniqueChildWeight(focusProgram)
    if (uniqueWeight) {
      focusProgram = focusProgram?.supporting.find(prog => prog.totalWeight === uniqueWeight) as Program
    } else {
      const uniformWeight = (
        focusProgram.supportedBy?.supporting.find(prog => prog.totalWeight !== focusProgram.totalWeight) as Program
      ).totalWeight
      const change = (uniformWeight as number) - (focusProgram.totalWeight as number)
      answer = focusProgram.weight + change
    }
  } while (answer === 0)
  return answer
}

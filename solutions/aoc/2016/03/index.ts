// Advent of Code | 2016 | Day 3 | Squares With Three Sides
// https://adventofcode.com/2016/day/3

const isValidTriangle = (triangle: number[]) => {
  if (triangle.length !== 3) {
    return false
  }
  const [a, b, c] = [...triangle].sort((x, y) => x - y)
  return a + b > c
}

const parseTriangleData = (data: string) => {
  return data.split('\n').map(line =>
    line
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(n => parseInt(n)),
  )
}

export const partOne = (input: string) => {
  const triangles = parseTriangleData(input)
  return triangles.filter(t => isValidTriangle(t)).length
}

export const partTwo = (input: string) => {
  const triangles = parseTriangleData(input)

  const revisedTriangles = []
  for (let r = 0; r < triangles.length; r += 3) {
    for (let c = 0; c <= 2; c++) {
      revisedTriangles.push([triangles[r][c], triangles[r + 1][c], triangles[r + 2][c]])
    }
  }

  return revisedTriangles.filter(t => isValidTriangle(t)).length
}

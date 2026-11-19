// Advent of Code | 2016 | Day 1 | No Time for a Taxicab
// https://adventofcode.com/2016/day/1

export const partOne = (input: string) => {
  const data = input;
  return data
    .split(", ")
    .map((item) => ({
      turn: item[0],
      dist: parseInt(item.substr(1, item.length - 1)),
    }))
    .reduce(
      (results, instruction) => {
        results.heading += instruction.turn === "R" ? 1 : -1;
        if (results.heading === 4) {
          results.heading = 0;
        }
        if (results.heading === -1) {
          results.heading = 3;
        }
        if (results.heading === 0) {
          results.location[1] += instruction.dist;
        }
        if (results.heading === 1) {
          results.location[0] += instruction.dist;
        }
        if (results.heading === 2) {
          results.location[1] -= instruction.dist;
        }
        if (results.heading === 3) {
          results.location[0] -= instruction.dist;
        }
        return results;
      },
      { heading: 0, location: [0, 0] },
    )
    .location.reduce((sum, num) => sum + Math.abs(num));
};

export const partTwo = (input: string) => {
  const data = input;
  return data
    .split(", ")
    .map((item) => ({
      turn: item[0],
      dist: parseInt(item.substr(1, item.length - 1)),
    }))
    .reduce(
      (results, instruction) => {
        results.heading += instruction.turn === "R" ? 1 : -1;
        if (results.heading === 4) {
          results.heading = 0;
        }
        if (results.heading === -1) {
          results.heading = 3;
        }
        if (results.heading === 0) {
          results.location[1] += instruction.dist;
        }
        if (results.heading === 1) {
          results.location[0] += instruction.dist;
        }
        if (results.heading === 2) {
          results.location[1] -= instruction.dist;
        }
        if (results.heading === 3) {
          results.location[0] -= instruction.dist;
        }
        if (
          !results.answer &&
          results.history.includes(results.location.join("|"))
        ) {
          results.answer = results.location;
        }
        results.history.push(results.location.join("|"));
        return results;
      },
      {
        heading: 0,
        location: [0, 0],
        history: [] as string[],
        answer: null as number[] | null,
      },
    )
    .answer!.reduce((sum, num) => sum + Math.abs(num));
};

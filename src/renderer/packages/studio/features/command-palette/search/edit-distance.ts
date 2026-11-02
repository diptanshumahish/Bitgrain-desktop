export const editDistance = (first: string, second: string): number => {
  let previous = Array.from({ length: second.length + 1 }, (_, index) => index);
  let beforePrevious = previous;
  for (let row = 1; row <= first.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= second.length; column += 1) {
      const cost = first[row - 1] === second[column - 1] ? 0 : 1;
      let best = Math.min(previous[column] + 1, current[column - 1] + 1, previous[column - 1] + cost);
      const swapped = row > 1 && column > 1 && first[row - 1] === second[column - 2] && first[row - 2] === second[column - 1];
      if (swapped) best = Math.min(best, beforePrevious[column - 2] + 1);
      current.push(best);
    }
    beforePrevious = previous;
    previous = current;
  }
  return previous[second.length];
};

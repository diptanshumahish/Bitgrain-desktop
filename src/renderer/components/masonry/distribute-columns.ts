export function distributeIntoColumns<T>(
  items: T[],
  columnCount: number,
  getHeightRatio: (item: T) => number,
): T[][] {
  const columns: T[][] = Array.from({ length: columnCount }, () => []);
  const heights: number[] = new Array<number>(columnCount).fill(0);

  for (const item of items) {
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest].push(item);
    heights[shortest] += getHeightRatio(item);
  }

  return columns;
}

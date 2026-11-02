import { dilateLattice, smoothLattice, type Lattice } from "./lattice-ops";

const DILATE_PASSES = 2;

const borderSeeds = (lattice: Lattice): number[] => {
  const seeds: number[] = [];
  for (let column = 0; column < lattice.columns; column++) seeds.push(column, (lattice.rows - 1) * lattice.columns + column);
  for (let row = 0; row < lattice.rows; row++) seeds.push(row * lattice.columns, row * lattice.columns + lattice.columns - 1);
  return seeds;
};

const neighbours = (index: number, lattice: Lattice): number[] => {
  const column = index % lattice.columns;
  const row = Math.floor(index / lattice.columns);
  const found: number[] = [];
  if (column > 0) found.push(index - 1);
  if (column < lattice.columns - 1) found.push(index + 1);
  if (row > 0) found.push(index - lattice.columns);
  if (row < lattice.rows - 1) found.push(index + lattice.columns);
  return found;
};

const floodBackground = (values: Float32Array, lattice: Lattice, threshold: number): Uint8Array => {
  const background = new Uint8Array(values.length);
  const queue = borderSeeds(lattice).filter((index) => values[index] < threshold);
  for (const index of queue) background[index] = 1;
  for (let cursor = 0; cursor < queue.length; cursor++) {
    for (const next of neighbours(queue[cursor], lattice)) {
      if (background[next] || values[next] >= threshold) continue;
      background[next] = 1;
      queue.push(next);
    }
  }
  return background;
};

export const confineMask = (values: Float32Array, lattice: Lattice, threshold: number): Float32Array => {
  const background = floodBackground(values, lattice, threshold);
  let mask: Float32Array = Float32Array.from(background, (outside) => 1 - outside);
  for (let pass = 0; pass < DILATE_PASSES; pass++) mask = dilateLattice(mask, lattice);
  smoothLattice(mask, lattice, 1);
  return mask;
};

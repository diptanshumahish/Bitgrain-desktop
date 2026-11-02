import { clamp01 } from "../shared/scalar-math";

export interface Lattice {
  columns: number;
  rows: number;
}

const percentile = (values: Float32Array, share: number): number => {
  const sorted = Float32Array.from(values).sort();
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(share * (sorted.length - 1))))];
};

export const stretch = (values: Float32Array, lowShare: number, highShare: number): Float32Array => {
  const low = percentile(values, lowShare);
  const span = Math.max(Number.EPSILON, percentile(values, highShare) - low);
  return values.map((value) => clamp01((value - low) / span));
};

export const equalise = (values: Float32Array): Float32Array => {
  const order = Array.from(values.keys()).sort((first, second) => values[first] - values[second]);
  const ranked = new Float32Array(values.length);
  order.forEach((index, rank) => { ranked[index] = rank / Math.max(1, values.length - 1); });
  return ranked;
};

const smoothLine = (data: Float32Array, scratch: Float32Array, start: number, stride: number, length: number): void => {
  for (let index = 0; index < length; index++) {
    const before = data[start + Math.max(0, index - 1) * stride];
    const after = data[start + Math.min(length - 1, index + 1) * stride];
    scratch[start + index * stride] = (before + 2 * data[start + index * stride] + after) / 4;
  }
};

export const smoothLattice = (data: Float32Array, lattice: Lattice, passes: number): void => {
  const scratch = new Float32Array(data.length);
  for (let pass = 0; pass < passes; pass++) {
    for (let row = 0; row < lattice.rows; row++) smoothLine(data, scratch, row * lattice.columns, 1, lattice.columns);
    for (let column = 0; column < lattice.columns; column++) smoothLine(scratch, data, column, lattice.columns, lattice.rows);
  }
};

const peakAround = (data: Float32Array, lattice: Lattice, column: number, row: number): number => {
  let peak = 0;
  for (let offsetY = -1; offsetY <= 1; offsetY++) {
    const sampleRow = Math.min(lattice.rows - 1, Math.max(0, row + offsetY));
    for (let offsetX = -1; offsetX <= 1; offsetX++) {
      peak = Math.max(peak, data[sampleRow * lattice.columns + Math.min(lattice.columns - 1, Math.max(0, column + offsetX))]);
    }
  }
  return peak;
};

export const dilateLattice = (data: Float32Array, lattice: Lattice): Float32Array => {
  const out = new Float32Array(data.length);
  for (let row = 0; row < lattice.rows; row++) {
    for (let column = 0; column < lattice.columns; column++) out[row * lattice.columns + column] = peakAround(data, lattice, column, row);
  }
  return out;
};

export const centralGradient = (data: Float32Array, lattice: Lattice, index: number): [number, number] => {
  const column = index % lattice.columns;
  const row = Math.floor(index / lattice.columns);
  const left = data[row * lattice.columns + Math.max(0, column - 1)];
  const right = data[row * lattice.columns + Math.min(lattice.columns - 1, column + 1)];
  const up = data[Math.max(0, row - 1) * lattice.columns + column];
  const down = data[Math.min(lattice.rows - 1, row + 1) * lattice.columns + column];
  return [(right - left) / 2, (down - up) / 2];
};

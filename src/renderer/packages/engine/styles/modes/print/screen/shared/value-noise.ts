const HASH_PRIME_X = 374761393;
const HASH_PRIME_Y = 668265263;
const HASH_MIX = 1274126177;
const SHIFT_A = 13;
const SHIFT_B = 16;
const UINT32_RANGE = 4294967296;

export const latticeHash = (column: number, row: number, seed: number): number => {
  let mixed = (Math.imul(column, HASH_PRIME_X) + Math.imul(row, HASH_PRIME_Y) + seed) | 0;
  mixed = Math.imul(mixed ^ (mixed >>> SHIFT_A), HASH_MIX);
  return ((mixed ^ (mixed >>> SHIFT_B)) >>> 0) / UINT32_RANGE;
};

export const valueNoise = (x: number, y: number, seed: number): number => {
  const column = Math.floor(x);
  const row = Math.floor(y);
  const offsetX = x - column;
  const offsetY = y - row;
  const easeX = offsetX * offsetX * (3 - 2 * offsetX);
  const easeY = offsetY * offsetY * (3 - 2 * offsetY);
  const top = latticeHash(column, row, seed) + (latticeHash(column + 1, row, seed) - latticeHash(column, row, seed)) * easeX;
  const bottom = latticeHash(column, row + 1, seed) + (latticeHash(column + 1, row + 1, seed) - latticeHash(column, row + 1, seed)) * easeX;
  return top + (bottom - top) * easeY;
};

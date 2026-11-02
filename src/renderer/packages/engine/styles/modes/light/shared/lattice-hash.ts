import { mix } from "./light-maths";

const PRIME_COLUMN = 374761393;
const PRIME_ROW = 668265263;
const PRIME_SALT = 2246822519;
const AVALANCHE = 1274126177;
const SHIFT_HIGH = 13;
const SHIFT_LOW = 16;
const UINT32_RANGE = 4294967296;

export const latticeHash = (column: number, row: number, salt = 0): number => {
  let hashed = (Math.imul(column, PRIME_COLUMN) + Math.imul(row, PRIME_ROW) + Math.imul(salt, PRIME_SALT)) | 0;
  hashed = Math.imul(hashed ^ (hashed >>> SHIFT_HIGH), AVALANCHE);
  return ((hashed ^ (hashed >>> SHIFT_LOW)) >>> 0) / UINT32_RANGE;
};

const ease = (value: number): number => value * value * (3 - 2 * value);

export const valueNoise = (x: number, y: number, salt = 0): number => {
  const column = Math.floor(x);
  const row = Math.floor(y);
  const blendX = ease(x - column);
  const blendY = ease(y - row);
  const top = mix(latticeHash(column, row, salt), latticeHash(column + 1, row, salt), blendX);
  const bottom = mix(latticeHash(column, row + 1, salt), latticeHash(column + 1, row + 1, salt), blendX);
  return mix(top, bottom, blendY);
};

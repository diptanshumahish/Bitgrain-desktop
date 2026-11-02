import { fract } from "./scalar-math";

const HASH_SINE_SCALE = 127.1;
const HASH_SPREAD = 43758.5453;
const ROW_OFFSET = 57.7;
const WANG_MULTIPLY_A = 374761393;
const WANG_ADD = 668265263;
const WANG_MULTIPLY_B = 1274126177;
const WANG_SHIFT_A = 13;
const WANG_SHIFT_B = 16;
const UINT32_RANGE = 4294967296;

const hash1 = (value: number): number => fract(HASH_SPREAD * Math.sin(HASH_SINE_SCALE * value));

export const hash2 = (column: number, row: number): number => hash1(column + ROW_OFFSET * row);

export const integerHash = (value: number): number => {
  let mixed = (Math.imul(value | 0, WANG_MULTIPLY_A) + WANG_ADD) | 0;
  mixed = Math.imul(mixed ^ (mixed >>> WANG_SHIFT_A), WANG_MULTIPLY_B);
  return ((mixed ^ (mixed >>> WANG_SHIFT_B)) >>> 0) / UINT32_RANGE;
};

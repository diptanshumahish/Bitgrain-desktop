const MULBERRY_INCREMENT = 0x6d2b79f5;
const UINT32_RANGE = 4294967296;
const SHIFT_A = 15;
const SHIFT_B = 7;
const SHIFT_C = 14;
const MIX_B = 61;

export type RandomSource = () => number;

export const seededRandom = (seed: number): RandomSource => {
  let state = seed >>> 0;
  return (): number => {
    state = (state + MULBERRY_INCREMENT) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> SHIFT_A), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> SHIFT_B), mixed | MIX_B);
    return ((mixed ^ (mixed >>> SHIFT_C)) >>> 0) / UINT32_RANGE;
  };
};

const HASH_X = 73856093;
const HASH_Y = 19349663;

const AVALANCHE_A = 0x85ebca6b;
const AVALANCHE_B = 0xc2b2ae35;
const AVALANCHE_SHIFT_A = 16;
const AVALANCHE_SHIFT_B = 13;

const avalanche = (value: number): number => {
  let mixed = value ^ (value >>> AVALANCHE_SHIFT_A);
  mixed = Math.imul(mixed, AVALANCHE_A);
  mixed ^= mixed >>> AVALANCHE_SHIFT_B;
  mixed = Math.imul(mixed, AVALANCHE_B);
  return (mixed ^ (mixed >>> AVALANCHE_SHIFT_A)) >>> 0;
};

export const cellHash = (column: number, row: number): number =>
  avalanche(Math.imul(HASH_X, column) ^ Math.imul(HASH_Y, row));

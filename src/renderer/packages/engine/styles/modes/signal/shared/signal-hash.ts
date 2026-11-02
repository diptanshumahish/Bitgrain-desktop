import type { RandomSource } from "../../../engine/seeded-random";

const PRIME_FIRST = 0x27d4eb2d;
const PRIME_SECOND = 0x165667b1;
const PRIME_SEED = 0x9e3779b1;
const MIX_A = 0x85ebca6b;
const MIX_B = 0xc2b2ae35;
const SHIFT_WIDE = 16;
const SHIFT_NARROW = 13;
const UINT32_RANGE = 4294967296;
const SEED_RANGE = 1000000;

export const hashUnit = (first: number, second: number, seed: number): number => {
  let mixed = Math.imul(first | 0, PRIME_FIRST) ^ Math.imul(second | 0, PRIME_SECOND) ^ Math.imul(seed | 0, PRIME_SEED);
  mixed ^= mixed >>> SHIFT_WIDE;
  mixed = Math.imul(mixed, MIX_A);
  mixed ^= mixed >>> SHIFT_NARROW;
  mixed = Math.imul(mixed, MIX_B);
  mixed ^= mixed >>> SHIFT_WIDE;
  return (mixed >>> 0) / UINT32_RANGE;
};

export const seedFrom = (random: RandomSource): number => Math.floor(random() * SEED_RANGE);

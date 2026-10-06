const MULBERRY_INCREMENT = 0x6d2b79f5;
const MULBERRY_SHIFT_A = 15;
const MULBERRY_SHIFT_B = 7;
const MULBERRY_SHIFT_C = 14;
const MULBERRY_MIX = 61;
const UINT32_RANGE = 4294967296;

export const DEFAULT_EFFECT_SEED = 1;

export type RandomSource = () => number;

export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return (): number => {
    state = (state + MULBERRY_INCREMENT) | 0;
    let mixed = Math.imul(state ^ (state >>> MULBERRY_SHIFT_A), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> MULBERRY_SHIFT_B), MULBERRY_MIX | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> MULBERRY_SHIFT_C)) >>> 0) / UINT32_RANGE;
  };
}

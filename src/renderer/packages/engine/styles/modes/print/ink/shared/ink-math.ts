export const clamp01 = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value);

export const mix = (from: number, to: number, amount: number): number => from + (to - from) * amount;

export const fract = (value: number): number => value - Math.floor(value);

export const smoothRange = (edgeStart: number, edgeEnd: number, value: number): number => {
  const position = clamp01((value - edgeStart) / (edgeEnd - edgeStart));
  return position * position * (3 - 2 * position);
};

const MIX_MULTIPLIER = 374761393;
const MIX_OFFSET = 668265263;
const MIX_SHIFT_A = 13;
const MIX_FINAL = 1274126177;
const MIX_SHIFT_B = 16;
const UINT32_RANGE = 4294967296;

const integerHash = (value: number): number => {
  let mixed = (Math.imul(value | 0, MIX_MULTIPLIER) + MIX_OFFSET) | 0;
  mixed = Math.imul(mixed ^ (mixed >>> MIX_SHIFT_A), MIX_FINAL);
  return ((mixed ^ (mixed >>> MIX_SHIFT_B)) >>> 0) / UINT32_RANGE;
};

const HASH_ROW_STRIDE = 7919;

export const pixelHash = (x: number, y: number, salt: number): number =>
  integerHash(x + Math.imul(y, HASH_ROW_STRIDE) + Math.imul(salt, HASH_ROW_STRIDE * HASH_ROW_STRIDE));

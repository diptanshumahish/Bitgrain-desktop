const PRIME_X = 374761393;
const PRIME_Y = 668265263;
const PRIME_SALT = 2246822519;
const MIX_PRIME = 1274126177;
const SHIFT_MIX = 13;
const SHIFT_FINAL = 16;
const UINT32_RANGE = 4294967296;

export const hash01 = (column: number, row: number, salt = 0): number => {
  let mixed = (Math.imul(column, PRIME_X) + Math.imul(row, PRIME_Y) + Math.imul(salt, PRIME_SALT)) | 0;
  mixed = Math.imul(mixed ^ (mixed >>> SHIFT_MIX), MIX_PRIME);
  return ((mixed ^ (mixed >>> SHIFT_FINAL)) >>> 0) / UINT32_RANGE;
};


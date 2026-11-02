const LUMA_RED = 0.299;
const LUMA_GREEN = 0.587;
const LUMA_BLUE = 0.114;

export const CHANNELS = 4;
export const BYTE_MAX = 255;
export const PERCENT = 100;
export const HALF_UNIT = 0.5;

export const lumaOf = (red: number, green: number, blue: number): number =>
  LUMA_RED * red + LUMA_GREEN * green + LUMA_BLUE * blue;

export const clampUnit = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value);

export const mixValue = (from: number, to: number, amount: number): number => from + (to - from) * amount;

export const smoothRange = (edgeStart: number, edgeEnd: number, value: number): number => {
  const position = clampUnit((value - edgeStart) / (edgeEnd - edgeStart));
  return position * position * (3 - 2 * position);
};

export const fractOf = (value: number): number => value - Math.floor(value);

export const clampInt = (value: number, size: number): number => (value < 0 ? 0 : value >= size ? size - 1 : value | 0);

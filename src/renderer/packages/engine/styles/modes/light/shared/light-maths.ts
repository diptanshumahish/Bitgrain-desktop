export const TAU = Math.PI * 2;
export const PERCENT = 100;
const LUMA_RED = 0.299;
const LUMA_GREEN = 0.587;
const LUMA_BLUE = 0.114;

export const clamp01 = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value);

export const mix = (from: number, to: number, amount: number): number => from + (to - from) * amount;

export const fract = (value: number): number => value - Math.floor(value);

export const smoothRange = (edgeStart: number, edgeEnd: number, value: number): number => {
  const clamped = clamp01((value - edgeStart) / (edgeEnd - edgeStart));
  return clamped * clamped * (3 - 2 * clamped);
};

export const lumaOfRgb = (red: number, green: number, blue: number): number =>
  LUMA_RED * red + LUMA_GREEN * green + LUMA_BLUE * blue;

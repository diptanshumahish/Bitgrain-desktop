export const clamp01 = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value);

export const clampRange = (value: number, low: number, high: number): number =>
  value < low ? low : value > high ? high : value;

export const lerp = (from: number, to: number, amount: number): number => from + (to - from) * amount;

export const smoothRange = (edgeLow: number, edgeHigh: number, value: number): number => {
  const amount = clamp01((value - edgeLow) / (edgeHigh - edgeLow));
  return amount * amount * (3 - 2 * amount);
};

export const fract = (value: number): number => value - Math.floor(value);

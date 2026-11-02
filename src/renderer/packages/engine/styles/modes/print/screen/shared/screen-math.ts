export const LUMA_RED = 0.299;
export const LUMA_GREEN = 0.587;
export const LUMA_BLUE = 0.114;
export const CHANNEL_MAX = 255;
export const CHANNELS = 4;
export const PERCENT = 100;
export const DEGREES_TO_RADIANS = Math.PI / 180;

const SINE_HASH_FREQUENCY = 127.1;
const SINE_HASH_GAIN = 43758.5453;

export const clampUnit = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value);

export const mix = (from: number, to: number, amount: number): number => from + (to - from) * amount;

export const fract = (value: number): number => value - Math.floor(value);

export const smoothRange = (edgeLow: number, edgeHigh: number, value: number): number => {
  const ratio = clampUnit((value - edgeLow) / (edgeHigh - edgeLow));
  return ratio * ratio * (3 - 2 * ratio);
};

export const sineHash = (value: number): number => fract(SINE_HASH_GAIN * Math.sin(SINE_HASH_FREQUENCY * value));

export const lumaOfRgb = (red: number, green: number, blue: number): number =>
  LUMA_RED * red + LUMA_GREEN * green + LUMA_BLUE * blue;

export const clampToGrid = (value: number, size: number): number => (value < 0 ? 0 : value >= size ? size - 1 : value | 0);

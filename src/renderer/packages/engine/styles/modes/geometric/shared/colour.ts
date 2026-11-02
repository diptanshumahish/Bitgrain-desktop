import { hexToRgbTriple, type RgbTriple } from "../../../postfx/pixel-ops";

const LUMA_RED = 0.299;
const LUMA_GREEN = 0.587;
const LUMA_BLUE = 0.114;
export const CHANNEL_MAX = 255;
export const CHANNELS = 4;

const HUE_SECTORS = 6;
const HALF = 0.5;

export const lumaOf = (red: number, green: number, blue: number): number =>
  LUMA_RED * red + LUMA_GREEN * green + LUMA_BLUE * blue;

export const rgbCss = (red: number, green: number, blue: number, alpha = 1): string =>
  `rgba(${Math.round(red)},${Math.round(green)},${Math.round(blue)},${alpha})`;

export const tripleCss = (colour: RgbTriple, alpha = 1): string => rgbCss(colour[0], colour[1], colour[2], alpha);

export const hexTriple = (hex: string): RgbTriple => hexToRgbTriple(hex);

export const mixTriple = (from: RgbTriple, to: RgbTriple, amount: number): RgbTriple =>
  [from[0] + (to[0] - from[0]) * amount, from[1] + (to[1] - from[1]) * amount, from[2] + (to[2] - from[2]) * amount];

const hueChannel = (low: number, high: number, hue: number): number => {
  const wrapped = hue < 0 ? hue + 1 : hue > 1 ? hue - 1 : hue;
  if (wrapped * HUE_SECTORS < 1) return low + (high - low) * HUE_SECTORS * wrapped;
  if (wrapped * 2 < 1) return high;
  if (wrapped * 3 < 2) return low + (high - low) * (2 / 3 - wrapped) * HUE_SECTORS;
  return low;
};

export const hslTriple = (hue: number, saturation: number, lightness: number): RgbTriple => {
  const high = lightness < HALF ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
  const low = 2 * lightness - high;
  const third = 1 / 3;
  return [hueChannel(low, high, hue + third) * CHANNEL_MAX, hueChannel(low, high, hue) * CHANNEL_MAX, hueChannel(low, high, hue - third) * CHANNEL_MAX];
};

export const hueAndSaturation = (colour: RgbTriple): [number, number] => {
  const [red, green, blue] = colour.map((channel) => channel / CHANNEL_MAX);
  const high = Math.max(red, green, blue);
  const low = Math.min(red, green, blue);
  const spread = high - low;
  if (spread <= 0) return [0, 0];
  const lightness = (high + low) / 2;
  const saturation = lightness > HALF ? spread / (2 - high - low) : spread / (high + low);
  const sector = high === red ? (green - blue) / spread + (green < blue ? HUE_SECTORS : 0) : high === green ? (blue - red) / spread + 2 : (red - green) / spread + 4;
  return [sector / HUE_SECTORS, saturation];
};

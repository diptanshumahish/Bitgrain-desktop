import type { RgbTriple } from "../../../../postfx/pixel-ops";

const CHANNEL_MAX = 255;
const LUMA_709_R = 0.2126;
const LUMA_709_G = 0.7152;
const LUMA_709_B = 0.0722;
const HUE_SEXTANTS = 6;
const HUE_GREEN_OFFSET = 2;
const HUE_BLUE_OFFSET = 4;
const ONE_THIRD = 1 / 3;
const ONE_HALF = 0.5;
const TWO_THIRDS = 2 / 3;

type Hsl = [number, number, number];

export const luma709 = (colour: RgbTriple): number =>
  LUMA_709_R * colour[0] + LUMA_709_G * colour[1] + LUMA_709_B * colour[2];

const hueOf = (red: number, green: number, blue: number, high: number, delta: number): number => {
  if (high === red) return (((green - blue) / delta + HUE_SEXTANTS) % HUE_SEXTANTS) / HUE_SEXTANTS;
  if (high === green) return ((blue - red) / delta + HUE_GREEN_OFFSET) / HUE_SEXTANTS;
  return ((red - green) / delta + HUE_BLUE_OFFSET) / HUE_SEXTANTS;
};

export const rgbToHsl = (colour: RgbTriple): Hsl => {
  const red = colour[0] / CHANNEL_MAX;
  const green = colour[1] / CHANNEL_MAX;
  const blue = colour[2] / CHANNEL_MAX;
  const high = Math.max(red, green, blue);
  const low = Math.min(red, green, blue);
  const lightness = (high + low) / 2;
  const delta = high - low;
  if (delta === 0) return [0, 0, lightness];
  const saturation = lightness > ONE_HALF ? delta / (2 - high - low) : delta / (high + low);
  return [hueOf(red, green, blue, high, delta), saturation, lightness];
};

const hueChannel = (low: number, high: number, hue: number): number => {
  const wrapped = hue < 0 ? hue + 1 : hue > 1 ? hue - 1 : hue;
  if (wrapped < 1 / HUE_SEXTANTS) return low + (high - low) * HUE_SEXTANTS * wrapped;
  if (wrapped < ONE_HALF) return high;
  if (wrapped < TWO_THIRDS) return low + (high - low) * (TWO_THIRDS - wrapped) * HUE_SEXTANTS;
  return low;
};

export const hslToRgb = (hsl: Hsl): RgbTriple => {
  const [hue, saturation, lightness] = hsl;
  if (saturation === 0) return [lightness * CHANNEL_MAX, lightness * CHANNEL_MAX, lightness * CHANNEL_MAX];
  const high = lightness < ONE_HALF ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
  const low = 2 * lightness - high;
  return [
    hueChannel(low, high, hue + ONE_THIRD) * CHANNEL_MAX,
    hueChannel(low, high, hue) * CHANNEL_MAX,
    hueChannel(low, high, hue - ONE_THIRD) * CHANNEL_MAX,
  ];
};

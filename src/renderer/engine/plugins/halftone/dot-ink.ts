import type { HalftoneStyle } from "./halftone-defaults";
import type { Rgb } from "./sample-bilinear";

const CHANNEL_MAX = 255;
const LUMA_RED = 0.2126;
const LUMA_GREEN = 0.7152;
const LUMA_BLUE = 0.0722;
const EMPTY_DENSITY = 0.001;

const lumaOf = (rgb: Rgb): number => (rgb[0] * LUMA_RED + rgb[1] * LUMA_GREEN + rgb[2] * LUMA_BLUE) / CHANNEL_MAX;

const fillRgb = (out: Rgb, value: number): void => {
  out[0] = value;
  out[1] = value;
  out[2] = value;
};

const resolveMonoInk = (sample: Rgb, onPaper: boolean, colourOut: Rgb): number => {
  fillRgb(colourOut, onPaper ? 0 : CHANNEL_MAX);
  const luma = lumaOf(sample);
  return onPaper ? 1 - luma : luma;
};

const resolvePaperColourInk = (sample: Rgb, colourOut: Rgb): number => {
  const density = 1 - Math.min(sample[0], sample[1], sample[2]) / CHANNEL_MAX;
  if (density < EMPTY_DENSITY) return 0;
  for (let channel = 0; channel < 3; channel++) {
    colourOut[channel] = CHANNEL_MAX - (CHANNEL_MAX - sample[channel]) / density;
  }
  return density;
};

const resolveDarkColourInk = (sample: Rgb, colourOut: Rgb): number => {
  const density = Math.max(sample[0], sample[1], sample[2]) / CHANNEL_MAX;
  if (density < EMPTY_DENSITY) return 0;
  for (let channel = 0; channel < 3; channel++) {
    colourOut[channel] = sample[channel] / density;
  }
  return density;
};

export const resolveDotInk = (sample: Rgb, style: HalftoneStyle, onPaper: boolean, colourOut: Rgb): number => {
  if (style !== "color") return resolveMonoInk(sample, onPaper, colourOut);
  return onPaper ? resolvePaperColourInk(sample, colourOut) : resolveDarkColourInk(sample, colourOut);
};

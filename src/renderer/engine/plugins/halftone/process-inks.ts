import type { Rgb } from "./sample-bilinear";

export type InkBlend = (paper: Rgb, ink: Rgb, coverage: number) => void;

export interface ProcessInks {
  angles: number[];
  inks: Rgb[];
  densityFor: (sample: Rgb, channel: number) => number;
  blend: InkBlend;
}

const CMYK_ANGLES = [15, 75, 0, 45];
const CMYK_INKS: Rgb[] = [
  [0, 255, 255],
  [255, 0, 255],
  [255, 255, 0],
  [0, 0, 0],
];
const RGB_ANGLES = [15, 75, 45];
const RGB_INKS: Rgb[] = [
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
];
const BLACK_CHANNEL = 3;
const BLACK_GAIN = 0.9;
const COLOUR_GAIN = 1.15;
const CHANNEL_MAX = 255;

const rgbToCmyk = (rgb: Rgb): [number, number, number, number] => {
  const cyan = 1 - rgb[0] / CHANNEL_MAX;
  const magenta = 1 - rgb[1] / CHANNEL_MAX;
  const yellow = 1 - rgb[2] / CHANNEL_MAX;
  const black = Math.min(cyan, magenta, yellow);
  if (black >= 1) return [0, 0, 0, 1];
  const remaining = 1 - black;
  return [(cyan - black) / remaining, (magenta - black) / remaining, (yellow - black) / remaining, black];
};

const cmykGainFor = (channel: number): number => (channel === BLACK_CHANNEL ? BLACK_GAIN : COLOUR_GAIN);

const multiplyInk: InkBlend = (paper, ink, coverage) => {
  for (let channel = 0; channel < 3; channel++) {
    const inked = (paper[channel] * ink[channel]) / CHANNEL_MAX;
    paper[channel] += (inked - paper[channel]) * coverage;
  }
};

const screenLight: InkBlend = (paper, ink, coverage) => {
  for (let channel = 0; channel < 3; channel++) {
    const lit = CHANNEL_MAX - ((CHANNEL_MAX - paper[channel]) * (CHANNEL_MAX - ink[channel])) / CHANNEL_MAX;
    paper[channel] += (lit - paper[channel]) * coverage;
  }
};

export const SUBTRACTIVE_INKS: ProcessInks = {
  angles: CMYK_ANGLES,
  inks: CMYK_INKS,
  densityFor: (sample, channel) => rgbToCmyk(sample)[channel] * cmykGainFor(channel),
  blend: multiplyInk,
};

export const ADDITIVE_LIGHTS: ProcessInks = {
  angles: RGB_ANGLES,
  inks: RGB_INKS,
  densityFor: (sample, channel) => (sample[channel] / CHANNEL_MAX) * COLOUR_GAIN,
  blend: screenLight,
};

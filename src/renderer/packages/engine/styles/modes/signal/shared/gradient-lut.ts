import { hexToRgbTriple } from "../../../postfx/pixel-ops";
import { BYTE_MAX } from "./signal-math";

const RGB = 3;
const LUT_SIZE = 256;

export interface GradientStop {
  at: number;
  hex: string;
}

const stopIndexFor = (stops: readonly GradientStop[], position: number): number => {
  let index = 0;
  while (index < stops.length - 2 && position > stops[index + 1].at) index++;
  return index;
};

const writeEntry = (lut: Uint8ClampedArray, entry: number, stops: readonly GradientStop[]): void => {
  const position = entry / BYTE_MAX;
  const index = stopIndexFor(stops, position);
  const from = hexToRgbTriple(stops[index].hex);
  const to = hexToRgbTriple(stops[index + 1].hex);
  const span = stops[index + 1].at - stops[index].at;
  const amount = span > 0 ? Math.min(1, Math.max(0, (position - stops[index].at) / span)) : 0;
  for (let channel = 0; channel < RGB; channel++) lut[entry * RGB + channel] = from[channel] + (to[channel] - from[channel]) * amount;
};

export const buildGradientLut = (stops: readonly GradientStop[]): Uint8ClampedArray => {
  const lut = new Uint8ClampedArray(LUT_SIZE * RGB);
  for (let entry = 0; entry < LUT_SIZE; entry++) writeEntry(lut, entry, stops);
  return lut;
};

import type { SourceImage } from "../../../engine/style-definition";
import { smoothstep } from "../../../postfx/pixel-ops";

const CHANNELS = 4;
const CHANNEL_MAX = 255;
const TAPS = 3;
const RGB_STRIDE = 3;
const TAP_SPREAD = 0.5;
const LOW_PERCENTILE = 0.02;
const HIGH_PERCENTILE = 0.995;
const MEDIAN_PERCENTILE = 0.5;
const MIDTONE_TARGET = 0.42;
const MIN_EXPONENT = 0.45;
const MAX_EXPONENT = 1.4;
const MIN_SPAN = 0.1;
const CURVE_AMOUNT = 0.6;
const LUMA_R = 0.299;
const LUMA_G = 0.587;
const LUMA_B = 0.114;

interface LedGridShape {
  pitch: number;
  columns: number;
  rows: number;
}

export interface LedField {
  intensity: Float32Array;
  colours: Float32Array;
}

const sampleCell = (source: SourceImage, shape: LedGridShape, cell: number, field: LedField): void => {
  const column = cell % shape.columns;
  const row = Math.floor(cell / shape.columns);
  let red = 0;
  let green = 0;
  let blue = 0;
  for (let tap = 0; tap < TAPS * TAPS; tap++) {
    const offsetX = ((tap % TAPS) / (TAPS - 1) - 0.5) * TAP_SPREAD;
    const offsetY = (Math.floor(tap / TAPS) / (TAPS - 1) - 0.5) * TAP_SPREAD;
    const x = Math.min(source.width - 1, Math.floor((column + 0.5 + offsetX) * shape.pitch));
    const y = Math.min(source.height - 1, Math.floor((row + 0.5 + offsetY) * shape.pitch));
    const index = (y * source.width + x) * CHANNELS;
    red += source.data[index];
    green += source.data[index + 1];
    blue += source.data[index + 2];
  }
  const taps = TAPS * TAPS;
  field.colours.set([red / taps, green / taps, blue / taps], cell * RGB_STRIDE);
  field.intensity[cell] = (LUMA_R * red + LUMA_G * green + LUMA_B * blue) / taps / CHANNEL_MAX;
};

const percentile = (sorted: Float32Array, fraction: number): number =>
  sorted[Math.min(sorted.length - 1, Math.floor(fraction * (sorted.length - 1)))];

const autoLevel = (intensity: Float32Array): void => {
  const sorted = Float32Array.from(intensity).sort();
  const low = percentile(sorted, LOW_PERCENTILE);
  const span = Math.max(MIN_SPAN, percentile(sorted, HIGH_PERCENTILE) - low);
  const median = Math.min(1 - Number.EPSILON, Math.max(Number.EPSILON, (percentile(sorted, MEDIAN_PERCENTILE) - low) / span));
  const exponent = Math.min(MAX_EXPONENT, Math.max(MIN_EXPONENT, Math.log(MIDTONE_TARGET) / Math.log(median)));
  for (let cell = 0; cell < intensity.length; cell++) {
    const levelled = Math.pow(Math.min(1, Math.max(0, (intensity[cell] - low) / span)), exponent);
    intensity[cell] = levelled + (smoothstep(levelled) - levelled) * CURVE_AMOUNT;
  }
};

export const fieldColour = (field: LedField, cell: number): [number, number, number] => {
  const index = cell * RGB_STRIDE;
  return [field.colours[index], field.colours[index + 1], field.colours[index + 2]];
};

export const buildLedField = (source: SourceImage, shape: LedGridShape): LedField => {
  const cells = shape.columns * shape.rows;
  const field: LedField = { intensity: new Float32Array(cells), colours: new Float32Array(cells * RGB_STRIDE) };
  for (let cell = 0; cell < cells; cell++) sampleCell(source, shape, cell, field);
  autoLevel(field.intensity);
  return field;
};

import { lumaPlane, type FloatImage } from "../shared/float-image";
import { clamp01 } from "../shared/light-maths";
import { boxBlurPlane } from "../shared/plane-blur";

const BINS = 1024;
const LOW_SHARE = 0.01;
const HIGH_SHARE = 0.99;
const MIN_SPAN = 0.12;
const BLUR_PASSES = 2;

export interface ToneStretch {
  low: number;
  span: number;
}

export interface DustField {
  values: Float32Array;
  width: number;
  height: number;
  stretch: ToneStretch;
}

const percentile = (histogram: Uint32Array, total: number, share: number): number => {
  const target = total * share;
  let seen = 0;
  for (let bin = 0; bin < BINS; bin++) {
    seen += histogram[bin];
    if (seen >= target) return bin / (BINS - 1);
  }
  return 1;
};

const stretchOf = (values: Float32Array): ToneStretch => {
  const histogram = new Uint32Array(BINS);
  for (let index = 0; index < values.length; index++) histogram[Math.round(clamp01(values[index]) * (BINS - 1))]++;
  const low = percentile(histogram, values.length, LOW_SHARE);
  const high = percentile(histogram, values.length, HIGH_SHARE);
  return { low, span: Math.max(MIN_SPAN, high - low) };
};

export const stretched = (stretch: ToneStretch, value: number): number => clamp01((value - stretch.low) / stretch.span);

export const buildDustField = (image: FloatImage, blurRadius: number): DustField => {
  const values = boxBlurPlane(lumaPlane(image), image.width, image.height, Math.max(1, blurRadius), BLUR_PASSES);
  const stretch = stretchOf(values);
  for (let index = 0; index < values.length; index++) values[index] = stretched(stretch, values[index]);
  return { values, width: image.width, height: image.height, stretch };
};

export const fieldAt = (field: DustField, x: number, y: number): number => {
  const column = Math.min(field.width - 1, Math.max(0, Math.floor(x)));
  const row = Math.min(field.height - 1, Math.max(0, Math.floor(y)));
  return field.values[row * field.width + column];
};

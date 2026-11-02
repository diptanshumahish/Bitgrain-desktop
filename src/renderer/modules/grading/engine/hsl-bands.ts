import type { HslAdjustment, HslAdjustments } from "./grade-types";
import { HSL_BANDS } from "./grade-defaults";
import { hslToRgbInPlace, rgbToHslInPlace, type ColorTriple } from "./hsl-convert";

export const HSL_BAND_CENTERS: readonly number[] = [0, 30, 60, 120, 180, 240, 280, 320];

const FULL_TURN = 360;
const PERCENT = 100;
const MAX_HUE_SHIFT = 30;
const MAX_LUMINANCE_SHIFT = 0.2;
const SATURATION_WEIGHT_GAIN = 4;

const findBandIndex = (hue: number): number => {
  for (let index = HSL_BAND_CENTERS.length - 1; index >= 0; index -= 1) {
    if (hue >= HSL_BAND_CENTERS[index]) return index;
  }
  return 0;
};

const blendAdjustments = (bands: HslAdjustment[], hue: number, out: ColorTriple): void => {
  const index = findBandIndex(hue);
  const nextIndex = (index + 1) % bands.length;
  const start = HSL_BAND_CENTERS[index];
  const end = nextIndex === 0 ? FULL_TURN : HSL_BAND_CENTERS[nextIndex];
  const mix = (hue - start) / (end - start);
  const from = bands[index];
  const to = bands[nextIndex];
  out[0] = from.hue + (to.hue - from.hue) * mix;
  out[1] = from.saturation + (to.saturation - from.saturation) * mix;
  out[2] = from.luminance + (to.luminance - from.luminance) * mix;
};

export const orderHslBands = (hsl: HslAdjustments): HslAdjustment[] => HSL_BANDS.map((band) => hsl[band]);

export const applyHslBands = (color: ColorTriple, bands: HslAdjustment[], scratch: ColorTriple): void => {
  rgbToHslInPlace(color);
  if (color[1] === 0) {
    hslToRgbInPlace(color);
    return;
  }
  blendAdjustments(bands, color[0], scratch);
  const saturationWeight = Math.min(1, color[1] * SATURATION_WEIGHT_GAIN);
  color[0] += (scratch[0] / PERCENT) * MAX_HUE_SHIFT;
  color[1] = Math.min(1, Math.max(0, color[1] * (1 + scratch[1] / PERCENT)));
  color[2] = Math.min(1, Math.max(0, color[2] + (scratch[2] / PERCENT) * MAX_LUMINANCE_SHIFT * saturationWeight));
  hslToRgbInPlace(color);
};

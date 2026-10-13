import type { ColorRange, LuminanceRange, RGB } from "./mask-types";
import type { PixelBuffer } from "../engine/apply-grade";

const PERCENT = 100;
const CHANNEL_MAX = 255;
const LUMA_RED = 0.2126;
const LUMA_GREEN = 0.7152;
const LUMA_BLUE = 0.0722;
const RED_MEAN_SCALE = 256;
const MAX_RED_MEAN_DISTANCE = 806;
const SECTOR_DEGREES = 60;
const FULL_TURN = 360;
const HALF_TURN = 180;
const SATURATION_DISTANCE_WEIGHT = 50;
const GRAY_TARGET_SATURATION = 0.08;

const rangeWeight = (value: number, min: number, max: number, softness: number): number => {
  if (value >= min && value <= max) return 1;
  if (softness <= 0) return 0;
  const distance = value < min ? min - value : value - max;
  return Math.max(0, 1 - distance / softness);
};

const luminanceWeight = (pixels: PixelBuffer, offset: number, range: LuminanceRange): number => {
  const luma = pixels[offset] * LUMA_RED + pixels[offset + 1] * LUMA_GREEN + pixels[offset + 2] * LUMA_BLUE;
  const low = Math.min(range.min, range.max);
  const high = Math.max(range.min, range.max);
  return rangeWeight((luma / CHANNEL_MAX) * PERCENT, low, high, range.softness);
};

interface HueSaturation {
  hue: number;
  saturation: number;
}

const hueSaturationOf = (red: number, green: number, blue: number): HueSaturation => {
  const max = Math.max(red, green, blue);
  const delta = max - Math.min(red, green, blue);
  if (delta === 0) return { hue: 0, saturation: 0 };
  const sector = max === red ? (green - blue) / delta : max === green ? (blue - red) / delta + 2 : (red - green) / delta + 4;
  return { hue: (sector * SECTOR_DEGREES + FULL_TURN) % FULL_TURN, saturation: delta / max };
};

const redMeanPercent = (pixels: PixelBuffer, offset: number, target: RGB): number => {
  const meanRed = (pixels[offset] + target[0]) / 2;
  const deltaRed = pixels[offset] - target[0];
  const deltaGreen = pixels[offset + 1] - target[1];
  const deltaBlue = pixels[offset + 2] - target[2];
  const distance = Math.sqrt(
    (2 + meanRed / RED_MEAN_SCALE) * deltaRed * deltaRed
    + 4 * deltaGreen * deltaGreen
    + (2 + (CHANNEL_MAX - meanRed) / RED_MEAN_SCALE) * deltaBlue * deltaBlue,
  );
  return (distance / MAX_RED_MEAN_DISTANCE) * PERCENT;
};

const hueDistancePercent = (pixel: HueSaturation, target: HueSaturation): number => {
  const rawDelta = Math.abs(pixel.hue - target.hue);
  const hueDelta = Math.min(rawDelta, FULL_TURN - rawDelta);
  return (hueDelta / HALF_TURN) * PERCENT + Math.abs(pixel.saturation - target.saturation) * SATURATION_DISTANCE_WEIGHT;
};

const colorWeight = (pixels: PixelBuffer, offset: number, range: ColorRange, target: HueSaturation): number => {
  const distance = target.saturation < GRAY_TARGET_SATURATION
    ? redMeanPercent(pixels, offset, range.color)
    : hueDistancePercent(hueSaturationOf(pixels[offset], pixels[offset + 1], pixels[offset + 2]), target);
  return rangeWeight(distance, 0, range.tolerance, range.softness);
};

export interface RangeRefinement {
  luminance: LuminanceRange;
  color: ColorRange;
}

export const multiplyRangeAlpha = (alpha: Float32Array, pixels: PixelBuffer, ranges: RangeRefinement): void => {
  if (!ranges.luminance.enabled && !ranges.color.enabled) return;
  const target = hueSaturationOf(...ranges.color.color);
  for (let index = 0; index < alpha.length; index += 1) {
    const offset = index * 4;
    const luminance = ranges.luminance.enabled ? luminanceWeight(pixels, offset, ranges.luminance) : 1;
    const color = ranges.color.enabled ? colorWeight(pixels, offset, ranges.color, target) : 1;
    alpha[index] *= luminance * color;
  }
};

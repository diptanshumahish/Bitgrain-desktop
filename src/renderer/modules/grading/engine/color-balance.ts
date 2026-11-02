import type { ColorGrade, ToneWheel } from "./grade-types";
import { hslToRgbInPlace, type ColorTriple } from "./hsl-convert";

const PERCENT = 100;
const TEMPERATURE_GAIN = 0.2;
const TINT_GREEN_GAIN = 0.15;
const TINT_SIDE_GAIN = 0.05;
const WHEEL_STRENGTH = 0.25;
const BALANCE_RANGE = 0.3;
const MIDPOINT = 0.5;
const FULL_SATURATION = 1;
const LUMA_RED = 0.2126;
const LUMA_GREEN = 0.7152;
const LUMA_BLUE = 0.0722;

export interface WhiteBalanceGains {
  red: number;
  green: number;
  blue: number;
}

export interface WheelOffsets {
  shadows: ColorTriple;
  midtones: ColorTriple;
  highlights: ColorTriple;
}

export const lumaOf = (red: number, green: number, blue: number): number =>
  red * LUMA_RED + green * LUMA_GREEN + blue * LUMA_BLUE;

export const buildWhiteBalanceGains = (grade: ColorGrade): WhiteBalanceGains => {
  const warmth = (grade.temperature / PERCENT) * TEMPERATURE_GAIN;
  const tint = grade.tint / PERCENT;
  return {
    red: (1 + warmth) * (1 + tint * TINT_SIDE_GAIN),
    green: 1 - tint * TINT_GREEN_GAIN,
    blue: (1 - warmth) * (1 + tint * TINT_SIDE_GAIN),
  };
};

const buildWheelOffset = (wheel: ToneWheel): ColorTriple => {
  const color = new Float32Array([wheel.hue, FULL_SATURATION, MIDPOINT]);
  hslToRgbInPlace(color);
  const luma = lumaOf(color[0], color[1], color[2]);
  const strength = (wheel.amount / PERCENT) * WHEEL_STRENGTH;
  return new Float32Array([(color[0] - luma) * strength, (color[1] - luma) * strength, (color[2] - luma) * strength]);
};

export const buildWheelOffsets = (grade: ColorGrade): WheelOffsets => ({
  shadows: buildWheelOffset(grade.wheels.shadows),
  midtones: buildWheelOffset(grade.wheels.midtones),
  highlights: buildWheelOffset(grade.wheels.highlights),
});

export const wheelPivot = (grade: ColorGrade): number => MIDPOINT + (grade.balance / PERCENT) * BALANCE_RANGE;

export const writeToneWeights = (luma: number, pivot: number, out: ColorTriple): void => {
  const shadows = Math.max(0, 1 - luma / pivot);
  const highlights = Math.max(0, (luma - pivot) / (1 - pivot));
  out[0] = shadows * shadows;
  out[2] = highlights * highlights;
  out[1] = Math.max(0, 1 - out[0] - out[2]);
};

export const applyVibrance = (color: ColorTriple, vibrance: number): void => {
  const max = Math.max(color[0], color[1], color[2]);
  const min = Math.min(color[0], color[1], color[2]);
  const boost = 1 + (vibrance / PERCENT) * (1 - (max - min));
  const luma = lumaOf(color[0], color[1], color[2]);
  color[0] = luma + (color[0] - luma) * boost;
  color[1] = luma + (color[1] - luma) * boost;
  color[2] = luma + (color[2] - luma) * boost;
};

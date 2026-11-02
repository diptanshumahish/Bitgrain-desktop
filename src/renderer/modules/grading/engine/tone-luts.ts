import type { ColorGrade, CurveChannel } from "./grade-types";
import { createCurveSampler, type CurveSampler } from "./curve-sampler";

export const TONE_LUT_SIZE = 256;

const PERCENT = 100;
const LEVELS_RANGE = 0.25;
const ZONE_SHIFT = 0.12;
const SHADOW_ANCHOR = 0.25;
const HIGHLIGHT_ANCHOR = 0.75;
const CHANNEL_MAX = 255;

export interface ChannelLuts {
  red: Float32Array;
  green: Float32Array;
  blue: Float32Array;
}

const clampUnit = (value: number): number => Math.min(1, Math.max(0, value));

const buildZoneSampler = (grade: ColorGrade): CurveSampler =>
  createCurveSampler([
    { x: 0, y: 0 },
    { x: SHADOW_ANCHOR, y: SHADOW_ANCHOR + (grade.shadows / PERCENT) * ZONE_SHIFT },
    { x: HIGHLIGHT_ANCHOR, y: HIGHLIGHT_ANCHOR + (grade.highlights / PERCENT) * ZONE_SHIFT },
    { x: 1, y: 1 },
  ]);

const buildLightSampler = (grade: ColorGrade): CurveSampler => {
  const exposureGain = Math.pow(2, grade.exposure);
  const blackPoint = -(grade.blacks / PERCENT) * LEVELS_RANGE;
  const whitePoint = 1 - (grade.whites / PERCENT) * LEVELS_RANGE;
  const zone = buildZoneSampler(grade);
  const master = createCurveSampler(grade.curves.master);
  return (x: number): number => {
    const exposed = clampUnit(x * exposureGain);
    const leveled = clampUnit((exposed - blackPoint) / (whitePoint - blackPoint));
    return master(zone(leveled));
  };
};

const buildChannelLut = (light: CurveSampler, channelCurve: CurveSampler): Float32Array => {
  const lut = new Float32Array(TONE_LUT_SIZE);
  for (let index = 0; index < TONE_LUT_SIZE; index += 1) {
    lut[index] = channelCurve(light(index / (TONE_LUT_SIZE - 1))) * CHANNEL_MAX;
  }
  return lut;
};

export const buildChannelLuts = (grade: ColorGrade): ChannelLuts => {
  const light = buildLightSampler(grade);
  const build = (channel: Exclude<CurveChannel, "master">): Float32Array =>
    buildChannelLut(light, createCurveSampler(grade.curves[channel]));
  return { red: build("red"), green: build("green"), blue: build("blue") };
};

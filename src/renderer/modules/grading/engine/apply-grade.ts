import type { ColorGrade, HslAdjustment } from "./grade-types";
import { hasActiveHsl, hasActiveWheels, isNeutralGrade } from "./grade-checks";
import { buildChannelLuts, TONE_LUT_SIZE, type ChannelLuts } from "./tone-luts";
import {
  applyVibrance,
  buildWheelOffsets,
  buildWhiteBalanceGains,
  lumaOf,
  wheelPivot,
  writeToneWeights,
  type WheelOffsets,
  type WhiteBalanceGains,
} from "./color-balance";
import { applyHslBands, orderHslBands } from "./hsl-bands";
import type { ColorTriple } from "./hsl-convert";

export type PixelBuffer = Float32Array | Uint8ClampedArray;

const CHANNEL_MAX = 255;
const LUT_LAST_INDEX = TONE_LUT_SIZE - 1;

interface GradePlan {
  luts: ChannelLuts;
  gains: WhiteBalanceGains;
  vibrance: number;
  bands: HslAdjustment[] | null;
  wheels: WheelOffsets | null;
  pivot: number;
}

interface GradeScratch {
  color: ColorTriple;
  hsl: ColorTriple;
  weights: ColorTriple;
}

const buildGradePlan = (grade: ColorGrade): GradePlan => ({
  luts: buildChannelLuts(grade),
  gains: buildWhiteBalanceGains(grade),
  vibrance: grade.vibrance,
  bands: hasActiveHsl(grade.hsl) ? orderHslBands(grade.hsl) : null,
  wheels: hasActiveWheels(grade.wheels) ? buildWheelOffsets(grade) : null,
  pivot: wheelPivot(grade),
});

const lutIndex = (value: number, gain: number): number =>
  Math.min(LUT_LAST_INDEX, Math.max(0, Math.round(value * gain)));

const clampColor = (color: ColorTriple): void => {
  color[0] = Math.min(1, Math.max(0, color[0]));
  color[1] = Math.min(1, Math.max(0, color[1]));
  color[2] = Math.min(1, Math.max(0, color[2]));
};

const addWheelTint = (color: ColorTriple, plan: GradePlan, wheels: WheelOffsets, weights: ColorTriple): void => {
  writeToneWeights(lumaOf(color[0], color[1], color[2]), plan.pivot, weights);
  for (let channel = 0; channel < 3; channel += 1) {
    color[channel] += weights[0] * wheels.shadows[channel]
      + weights[1] * wheels.midtones[channel]
      + weights[2] * wheels.highlights[channel];
  }
};

const gradePixel = (data: PixelBuffer, offset: number, plan: GradePlan, scratch: GradeScratch): void => {
  const { color } = scratch;
  color[0] = plan.luts.red[lutIndex(data[offset], plan.gains.red)] / CHANNEL_MAX;
  color[1] = plan.luts.green[lutIndex(data[offset + 1], plan.gains.green)] / CHANNEL_MAX;
  color[2] = plan.luts.blue[lutIndex(data[offset + 2], plan.gains.blue)] / CHANNEL_MAX;
  if (plan.vibrance !== 0) applyVibrance(color, plan.vibrance);
  clampColor(color);
  if (plan.bands) applyHslBands(color, plan.bands, scratch.hsl);
  if (plan.wheels) addWheelTint(color, plan, plan.wheels, scratch.weights);
  clampColor(color);
  data[offset] = color[0] * CHANNEL_MAX;
  data[offset + 1] = color[1] * CHANNEL_MAX;
  data[offset + 2] = color[2] * CHANNEL_MAX;
};

export const applyGrade = (data: PixelBuffer, grade: ColorGrade | null | undefined): void => {
  if (!grade || isNeutralGrade(grade)) return;
  const plan = buildGradePlan(grade);
  const scratch: GradeScratch = {
    color: new Float32Array(3),
    hsl: new Float32Array(3),
    weights: new Float32Array(3),
  };
  for (let offset = 0; offset < data.length; offset += 4) {
    gradePixel(data, offset, plan, scratch);
  }
};

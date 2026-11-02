import type { ParamValues } from "../../../../engine/style-types";
import { numberParam, textParam } from "../../../../engine/resolve-params";
import { hexToRgbTriple, type RgbTriple } from "../../../../postfx/pixel-ops";
import { hslToRgb, luma709, rgbToHsl } from "./hsl-colour";
import type { StudioLevels } from "./studio-levels";
import { STUDIO_KEYS } from "../ascii-studio-params";

const PERCENT = 100;
const VIBRANCE_GAIN = 1.6;
const FULL_TURN = 360;
const MIN_POSTERIZE = 2;

export interface StudioGrade {
  saturation: number;
  vibrance: number;
  hueTurn: number;
  tint: RgbTriple;
  tintAmount: number;
  black: number;
  white: number;
  inverseGamma: number;
  steps: number;
  invert: boolean;
  needsHsl: boolean;
  lumaMin: number;
  lumaRange: number;
}

export const buildStudioGrade = (params: ParamValues, invert: boolean, levels: StudioLevels): StudioGrade => {
  const saturation = numberParam(params, STUDIO_KEYS.saturation) / PERCENT;
  const vibrance = numberParam(params, STUDIO_KEYS.vibrance) / PERCENT;
  const hueTurn = numberParam(params, STUDIO_KEYS.hue) / FULL_TURN;
  return {
    saturation,
    vibrance,
    hueTurn,
    tint: hexToRgbTriple(textParam(params, STUDIO_KEYS.tintColour)),
    tintAmount: numberParam(params, STUDIO_KEYS.tintAmount) / PERCENT,
    black: numberParam(params, STUDIO_KEYS.blackPoint) / PERCENT,
    white: numberParam(params, STUDIO_KEYS.whitePoint) / PERCENT,
    inverseGamma: levels.midExponent / Math.max(numberParam(params, STUDIO_KEYS.gamma), Number.EPSILON),
    steps: Math.round(numberParam(params, STUDIO_KEYS.posterize)),
    invert,
    needsHsl: saturation !== 0 || vibrance !== 0 || hueTurn !== 0,
    lumaMin: levels.lumaMin,
    lumaRange: Math.max(levels.lumaRange, 1),
  };
};

const shiftHsl = (grade: StudioGrade, colour: RgbTriple): RgbTriple => {
  const [hue, saturation, lightness] = rgbToHsl(colour);
  const boosted = Math.min(1, Math.max(0, saturation * (1 + grade.saturation)));
  const vivid = Math.min(1, boosted + grade.vibrance * (1 - boosted) * boosted * VIBRANCE_GAIN);
  const turned = (((hue + grade.hueTurn) % 1) + 1) % 1;
  return hslToRgb([turned, vivid, lightness]);
};

export const gradeColour = (grade: StudioGrade, colour: RgbTriple): RgbTriple => {
  const shifted = grade.needsHsl ? shiftHsl(grade, colour) : colour;
  if (grade.tintAmount <= 0) return shifted;
  const amount = grade.tintAmount;
  return [
    shifted[0] + (grade.tint[0] - shifted[0]) * amount,
    shifted[1] + (grade.tint[1] - shifted[1]) * amount,
    shifted[2] + (grade.tint[2] - shifted[2]) * amount,
  ];
};

export const studioLevel = (grade: StudioGrade, colour: RgbTriple): number => {
  const span = Math.max(grade.white - grade.black, Number.EPSILON);
  const stretched = (luma709(colour) - grade.lumaMin) / grade.lumaRange;
  const levelled = Math.min(1, Math.max(0, (stretched - grade.black) / span));
  const curved = Math.pow(levelled, grade.inverseGamma);
  const stepped = grade.steps >= MIN_POSTERIZE ? Math.round(curved * (grade.steps - 1)) / (grade.steps - 1) : curved;
  return grade.invert ? 1 - stepped : stepped;
};

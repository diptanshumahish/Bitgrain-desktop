import type { ImageProfile } from "./analysis/image-profile";
import type { MoshRecipe } from "./mosh-recipes";

export interface ToneSettings {
  contrast: number;
  brightness: number;
  saturation: number;
  hue: number;
}

const TARGET_LUMA = 0.5;
const TARGET_SPREAD = 0.22;
const TARGET_SATURATION = 0.3;
const BRIGHTNESS_CORRECTION = 0.5;
const MIN_CONTRAST = 1.0;
const MAX_CONTRAST = 2.4;
const MIN_BRIGHTNESS = 0.82;
const MAX_BRIGHTNESS = 1.25;
const MIN_SCALE = 0.75;
const MAX_SCALE = 1.35;
const CONTRAST_JITTER = 0.08;
const SATURATION_JITTER = 0.1;
const HUE_JITTER_RANGE = 15;
const FULL_TURN = 360;
const EPSILON = 0.01;

const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value));

const round2 = (value: number): number => Math.round(value * 100) / 100;

const jitter = (value: number, range: number): number => value + (Math.random() * 2 - 1) * range;

const correctionScale = (target: number, actual: number): number =>
  clamp(target / Math.max(EPSILON, actual), MIN_SCALE, MAX_SCALE);

const tunedHue = (hue: number): number =>
  hue === 0 ? 0 : (hue + Math.round(jitter(0, HUE_JITTER_RANGE)) + FULL_TURN) % FULL_TURN;

export const tuneTone = (recipe: MoshRecipe, profile: ImageProfile): ToneSettings => {
  const contrast = recipe.contrast * correctionScale(TARGET_SPREAD, profile.lumaSpread);
  const brightness = recipe.brightness + (TARGET_LUMA - profile.meanLuma) * BRIGHTNESS_CORRECTION;
  const saturation = recipe.saturation * correctionScale(TARGET_SATURATION, profile.meanSaturation);
  return {
    contrast: round2(clamp(jitter(contrast, CONTRAST_JITTER), MIN_CONTRAST, MAX_CONTRAST)),
    brightness: round2(clamp(brightness, MIN_BRIGHTNESS, MAX_BRIGHTNESS)),
    saturation: recipe.saturation === 0 ? 0 : round2(Math.max(0, jitter(saturation, SATURATION_JITTER))),
    hue: tunedHue(recipe.hue),
  };
};

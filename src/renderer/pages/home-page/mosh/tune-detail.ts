import { HIGH_DETAIL, LOW_DETAIL, type ImageProfile } from "./analysis/image-profile";
import type { MoshRecipe } from "./mosh-recipes";

export interface DetailSettings {
  resolution: number;
  ditherFactor: number;
  cell: number;
  asciiDensity?: number;
}

const FINEST_CELL = 2;
const SOFT_CELL = 3;
const FINEST_RESOLUTION = 2.0;
const SOFT_RESOLUTION_FLOOR = 1.85;
const DITHER_FACTOR_JITTER = 0.05;
const DENSITY_DETAIL_GAIN = 0.4;
const DETAIL_MIDPOINT = 0.5;

const pickBetween = (low: number, high: number): number => low + Math.floor(Math.random() * (high - low + 1));

const round2 = (value: number): number => Math.round(value * 100) / 100;

const cellFor = (profile: ImageProfile): number => {
  if (profile.detail < LOW_DETAIL) return pickBetween(FINEST_CELL, SOFT_CELL);
  return FINEST_CELL;
};

const resolutionFor = (profile: ImageProfile): number => {
  if (profile.detail > HIGH_DETAIL) return FINEST_RESOLUTION;
  return round2(SOFT_RESOLUTION_FLOOR + Math.random() * (FINEST_RESOLUTION - SOFT_RESOLUTION_FLOOR));
};

const densityFor = (recipe: MoshRecipe, profile: ImageProfile): number | undefined => {
  if (recipe.asciiDensity === undefined) return undefined;
  return round2(recipe.asciiDensity * (1 + (profile.detail - DETAIL_MIDPOINT) * DENSITY_DETAIL_GAIN));
};

export const tuneDetail = (recipe: MoshRecipe, profile: ImageProfile): DetailSettings => ({
  resolution: resolutionFor(profile),
  ditherFactor: round2(recipe.ditherFactor + (Math.random() * 2 - 1) * DITHER_FACTOR_JITTER),
  cell: cellFor(profile),
  asciiDensity: densityFor(recipe, profile),
});

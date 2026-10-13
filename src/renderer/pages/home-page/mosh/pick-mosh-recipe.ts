import type { TransformMode } from "../../../engine/types";
import { HIGH_DETAIL, LOW_DETAIL, MUTED_SATURATION, VIVID_SATURATION, type ImageProfile } from "./analysis/image-profile";
import { MOSH_RECIPES, type MoshRecipe } from "./mosh-recipes";

const FAVORED = 1.6;
const DISFAVORED = 0.45;
const SAME_MODE_PENALTY = 0.3;
const DETAIL_LOVING_MODES: TransformMode[] = ["dither", "halftone", "braille", "manga"];
const SMOOTH_LOVING_MODES: TransformMode[] = ["popart", "contour", "ascii"];

const lastPick = { recipe: null as MoshRecipe | null };

const colorWeight = (recipe: MoshRecipe, profile: ImageProfile): number => {
  const wantsColor = recipe.isColor && !recipe.usesPalette;
  if (profile.meanSaturation < MUTED_SATURATION) return wantsColor ? DISFAVORED : FAVORED;
  if (profile.meanSaturation > VIVID_SATURATION) return wantsColor ? FAVORED : DISFAVORED;
  return 1;
};

const detailWeight = (mode: TransformMode, profile: ImageProfile): number => {
  if (profile.detail > HIGH_DETAIL && DETAIL_LOVING_MODES.includes(mode)) return FAVORED;
  if (profile.detail < LOW_DETAIL && SMOOTH_LOVING_MODES.includes(mode)) return FAVORED;
  return 1;
};

const weightOf = (recipe: MoshRecipe, profile: ImageProfile): number => {
  const previous = lastPick.recipe;
  if (recipe === previous) return 0;
  const mode = recipe.modes[0];
  const repeatPenalty = previous?.modes[0] === mode ? SAME_MODE_PENALTY : 1;
  return colorWeight(recipe, profile) * detailWeight(mode, profile) * repeatPenalty;
};

export const pickMoshRecipe = (profile: ImageProfile): MoshRecipe => {
  const weights = MOSH_RECIPES.map((recipe) => weightOf(recipe, profile));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = Math.random() * total;
  const index = weights.findIndex((weight) => (roll -= weight) <= 0);
  const picked = MOSH_RECIPES[index === -1 ? MOSH_RECIPES.length - 1 : index];
  lastPick.recipe = picked;
  return picked;
};

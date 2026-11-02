import type { TransformMode } from "@bitgrain/engine/core/types";
import { activeEffects } from "@bitgrain/engine/styles/postfx/effect-registry";
import { FILTER_ENTRIES } from "../../toolbar/filter-modes";
import { isStackedMode } from "../../toolbar/effects/main-effect-modes";
import { HAZE_MODE } from "@bitgrain/engine/utils/haze-order";
import type { RecipeInputs, RecipeStep } from "../recipe-types";

const EFFECT_DETAIL = "Effect";
const STACKED_DETAIL = "Effect from a preset";
const GRAIN_MODE: TransformMode = "grain";

const stackedTitle = (mode: TransformMode): string => {
  if (mode === GRAIN_MODE) return "Film grain";
  if (mode === HAZE_MODE) return "Haze and glow";
  return FILTER_ENTRIES.find((entry) => entry.id === mode)?.label ?? EFFECT_DETAIL;
};

const postEffectSteps = (inputs: RecipeInputs): RecipeStep[] =>
  activeEffects(inputs.styleSettings.effects).map((effect) => ({
    id: `effect:${effect.key}`,
    kind: "effect",
    title: effect.label,
    detail: EFFECT_DETAIL,
    panel: "effect",
    effectKey: effect.key,
    removal: { type: "effect", key: effect.key },
  }));

const stackedModeSteps = (inputs: RecipeInputs): RecipeStep[] =>
  inputs.modes.filter(isStackedMode).map((mode) => ({
    id: `mode:${mode}`,
    kind: "effect",
    title: stackedTitle(mode),
    detail: STACKED_DETAIL,
    panel: null,
    removal: { type: "mode", mode },
  }));

export const effectSteps = (inputs: RecipeInputs): RecipeStep[] => [
  ...postEffectSteps(inputs),
  ...stackedModeSteps(inputs),
];

import type { TransformMode } from "@bitgrain/engine/core/types";
import { findStyle } from "@bitgrain/engine/styles/engine/style-registry";
import { CLASSIC_ENTRIES } from "../../toolbar/inspector/look/classic-entries";
import { ditherMethodInfo } from "../../toolbar/popovers/dither/dither-methods";
import { mainEffectOf } from "../../toolbar/effects/main-effect-modes";
import type { RecipeInputs, RecipeStep } from "../recipe-types";

const ORIGINAL_MODE: TransformMode = "original";
const STYLE_MODE: TransformMode = "style";
const DITHER_MODE: TransformMode = "dither";
const LOOK_DETAIL = "Look";

const lookTitle = (mode: TransformMode, styleId: string): string => {
  if (mode === STYLE_MODE) return findStyle(styleId).label;
  return CLASSIC_ENTRIES.find((entry) => entry.mode === mode)?.label ?? LOOK_DETAIL;
};

const lookDetail = (mode: TransformMode, inputs: RecipeInputs): string => {
  if (mode !== DITHER_MODE) return LOOK_DETAIL;
  const method = ditherMethodInfo(inputs.ditherMethod)?.name;
  return method ? `${LOOK_DETAIL}, ${method}` : LOOK_DETAIL;
};

export const lookSteps = (inputs: RecipeInputs): RecipeStep[] => {
  const mode = mainEffectOf(inputs.modes);
  if (mode === ORIGINAL_MODE) return [];
  return [{
    id: "look",
    kind: "look",
    title: lookTitle(mode, inputs.styleSettings.styleId),
    detail: lookDetail(mode, inputs),
    panel: "effects",
    removal: { type: "look" },
  }];
};

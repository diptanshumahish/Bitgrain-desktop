import { brightnessSignal, contrastSignal, hueSignal, isColorSignal, lutIdSignal, modesSignal, NEUTRAL_HUE, NEUTRAL_TONE, paletteSignal, saturationSignal } from "../state/transform-store";
import { printFinishSignal } from "@bitgrain/engine/finish/print-finish-state";
import { pushHistory } from "../state/history-store";
import { trackEvent } from "@bitgrain/platform/tracker";
import { colorGradeSignal } from "../grading/editor/editor-grade-store";
import { DEFAULT_COLOR_GRADE } from "@bitgrain/engine/grading/engine/grade-defaults";
import { setStyleEffects, styleSettingsSignal } from "../styles/state/style-store";
import { withEffectEnabled } from "../styles/state/style-edits";
import { selectMainEffect } from "../toolbar/effects/select-main-effect";
import { withoutMode } from "../toolbar/effects/main-effect-modes";
import type { RecipeRemoval, RecipeStep } from "./recipe-types";

const resetAdjustments = (): void => {
  contrastSignal.value = NEUTRAL_TONE;
  brightnessSignal.value = NEUTRAL_TONE;
  saturationSignal.value = NEUTRAL_TONE;
  hueSignal.value = NEUTRAL_HUE;
  colorGradeSignal.value = DEFAULT_COLOR_GRADE;
};

const applyRemoval = (removal: RecipeRemoval): void => {
  switch (removal.type) {
    case "look": selectMainEffect("original"); return;
    case "effect": setStyleEffects(withEffectEnabled(styleSettingsSignal.value.effects, removal.key, false)); return;
    case "mode": modesSignal.value = withoutMode(modesSignal.value, removal.mode); return;
    case "palette": paletteSignal.value = null; return;
    case "mono": isColorSignal.value = true; return;
    case "lut": lutIdSignal.value = null; return;
    case "adjust": resetAdjustments(); return;
    case "finish": printFinishSignal.value = false; return;
  }
};

export const removeRecipeStep = (step: RecipeStep): void => {
  applyRemoval(step.removal);
  pushHistory();
  trackEvent("home", "recipe_step_removed", { details: { kind: step.kind, step: step.id } });
};

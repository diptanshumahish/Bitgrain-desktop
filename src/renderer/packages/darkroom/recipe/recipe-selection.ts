import { signal } from "@bitgrain/core/signal";
import { trackEvent } from "@bitgrain/platform/tracker";
import { activePanelSignal } from "../toolbar/panel-state/active-panel-store";
import type { InspectorPanel } from "../toolbar/toolbar-types";
import type { RecipeStep } from "./recipe-types";

const EFFECT_PANEL: InspectorPanel = "effect";

export const selectedEffectKeySignal = signal<string | null>(null);

export const rememberStepEffect = (step: RecipeStep): void => {
  if (step.effectKey) selectedEffectKeySignal.value = step.effectKey;
};

export const openPresets = (): void => {
  activePanelSignal.value = "presets";
};

export const selectRecipeStep = (step: RecipeStep): void => {
  if (!step.panel) return;
  rememberStepEffect(step);
  activePanelSignal.value = step.panel;
  trackEvent("home", "recipe_step_selected", { details: { kind: step.kind } });
};

export const isRecipeStepSelected = (step: RecipeStep, panel: InspectorPanel, effectKey: string | null): boolean => {
  if (step.panel !== panel) return false;
  return panel !== EFFECT_PANEL || step.effectKey === effectKey;
};

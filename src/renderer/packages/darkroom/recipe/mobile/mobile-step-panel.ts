import { signal } from "@bitgrain/core/signal";
import { modesSignal } from "../../state/transform-store";
import { activePanelSignal } from "../../toolbar/panel-state/active-panel-store";
import { mainEffectOf } from "../../toolbar/effects/main-effect-modes";
import { classicPanelFor } from "../../toolbar/inspector/look/classic-entries";
import type { ActivePopover } from "../../toolbar/toolbar-types";
import { rememberStepEffect } from "../recipe-selection";
import type { RecipeStep } from "../recipe-types";

const STYLE_SETTINGS_PANEL: ActivePopover = "styles";

export const openedFromRecipeSignal = signal(false);

export const clearRecipeOrigin = (): void => {
  openedFromRecipeSignal.value = false;
};

const mobilePanelFor = (step: RecipeStep): ActivePopover => {
  if (step.kind === "look") return classicPanelFor(mainEffectOf(modesSignal.value)) ?? STYLE_SETTINGS_PANEL;
  if (step.removal.type === "mono") return null;
  return step.panel;
};

export const openRecipeSheet = (panel: ActivePopover): void => {
  openedFromRecipeSignal.value = true;
  activePanelSignal.value = panel;
};

export const openMobileRecipeStep = (step: RecipeStep): void => {
  const panel = mobilePanelFor(step);
  if (!panel) return;
  rememberStepEffect(step);
  openRecipeSheet(panel);
};

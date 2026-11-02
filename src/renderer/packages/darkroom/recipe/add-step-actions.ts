import { isColorSignal } from "../state/transform-store";
import { printFinishSignal } from "@bitgrain/engine/finish/print-finish-state";
import { pushHistory } from "../state/history-store";
import { trackEvent } from "@bitgrain/platform/tracker";
import { setStyleEffects, styleSettingsSignal } from "../styles/state/style-store";
import { withEffectEnabled } from "../styles/state/style-edits";
import { activePanelSignal, openEffectsPicker } from "../toolbar/panel-state/active-panel-store";
import { editorLayoutSignal } from "../toolbar/panel-state/editor-layout-store";
import { openStyleBrowser } from "../toolbar/style-browser/style-browser-store";
import type { InspectorPanel } from "../toolbar/toolbar-types";
import { selectedEffectKeySignal } from "./recipe-selection";

const trackAdd = (step: string): void => {
  trackEvent("home", "recipe_step_added", { details: { step } });
};

export const chooseLook = (): void => {
  trackAdd("look");
  if (editorLayoutSignal.value === "phone") openEffectsPicker();
  else openStyleBrowser();
};

export const openStepPanel = (panel: InspectorPanel): void => {
  trackAdd(panel);
  activePanelSignal.value = panel;
};

export const addEffectStep = (key: string): void => {
  setStyleEffects(withEffectEnabled(styleSettingsSignal.value.effects, key, true));
  pushHistory();
  selectedEffectKeySignal.value = key;
  activePanelSignal.value = "effect";
  trackAdd(`effect:${key}`);
};

export const addPaperStep = (): void => {
  printFinishSignal.value = true;
  pushHistory();
  activePanelSignal.value = "finish";
  trackAdd("finish");
};

export const addMonoStep = (): void => {
  isColorSignal.value = false;
  pushHistory();
  activePanelSignal.value = editorLayoutSignal.value === "phone" ? "recipe" : "colour";
  trackAdd("mono");
};

import { applySnapshot, captureSnapshot, resetTransform } from "../../state/transform-store";
import { type TransformSnapshot } from "@bitgrain/engine/core/transform-snapshot";
import { resetHistory } from "../../state/history-store";
import { openEffectsPicker } from "../../toolbar/panel-state/active-panel-store";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { takePendingRecipe, type PendingRecipe } from "./pending-recipe-store";
import { loadEditState } from "./edit-state-storage";
import { markEditsBaseline } from "./unexported-edits";
import { exportedThisImageSignal } from "../../state/editor-view-store";

const applyPartialLook = (look: Partial<TransformSnapshot>): void => {
  applySnapshot({ ...captureSnapshot(), ...look } as TransformSnapshot);
};

const announceRecipe = (recipe: PendingRecipe): void => {
  emitStatusToast({ title: "Recipe applied", detail: `Your photo now uses the ${recipe.lookName} look.` });
};

export const applyStartingLook = (): void => {
  const recipe = takePendingRecipe();
  exportedThisImageSignal.value = false;
  resetTransform();
  markEditsBaseline();
  if (recipe) {
    applyPartialLook(recipe.snapshot);
    announceRecipe(recipe);
  } else {
    openEffectsPicker();
  }
  resetHistory();
};

export const applyHeldRecipeToCurrentImage = (): void => {
  const recipe = takePendingRecipe();
  if (!recipe) return;
  applyPartialLook(recipe.snapshot);
  announceRecipe(recipe);
  resetHistory();
};

export const restoreEditSession = (): void => {
  const recipe = takePendingRecipe();
  resetTransform();
  markEditsBaseline();
  const look = recipe?.snapshot ?? loadEditState();
  if (look) applyPartialLook(look);
  if (recipe) announceRecipe(recipe);
  resetHistory();
};

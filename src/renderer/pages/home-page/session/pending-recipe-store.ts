import { signal } from "../../../lib/signal";
import type { TransformSnapshot } from "../../../store/transform-store";
import { currentEffectLabel } from "../../../components/toolbar/effects/current-effect-label";

export interface PendingRecipe {
  snapshot: Partial<TransformSnapshot>;
  lookName: string;
}

const FALLBACK_LOOK_NAME = "shared";

export const pendingRecipeSignal = signal<PendingRecipe | null>(null);

const lookNameFor = (snapshot: Partial<TransformSnapshot>): string => {
  const label = currentEffectLabel(snapshot.modes ?? []);
  return label === "effects" ? FALLBACK_LOOK_NAME : label;
};

export const holdRecipe = (snapshot: Partial<TransformSnapshot>): void => {
  pendingRecipeSignal.value = { snapshot, lookName: lookNameFor(snapshot) };
};

export const takePendingRecipe = (): PendingRecipe | null => {
  const pending = pendingRecipeSignal.value;
  pendingRecipeSignal.value = null;
  return pending;
};

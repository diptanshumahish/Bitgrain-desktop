import { applySnapshot, captureSnapshot } from "../../state/transform-store";
import { pushHistory } from "../../state/history-store";
import { imageSignal } from "../../state/image-store";
import { trackEvent } from "@bitgrain/platform/tracker";
import { buildMoshSnapshot } from "./build-mosh-snapshot";
import { getImageProfile } from "./analysis/get-image-profile";
import { pickMoshRecipe } from "./pick-mosh-recipe";
import { emitMoshRoll } from "./feedback/mosh-roll-events";
import { playRollSound } from "./feedback/play-roll-sound";
import { emitMoshResult } from "./feedback/mosh-result-events";
import { describeMoshResult } from "./describe/describe-mosh-result";

const runMosh = async (): Promise<void> => {
  const profile = await getImageProfile(imageSignal.value);
  const recipe = pickMoshRecipe(profile);
  const next = buildMoshSnapshot(recipe, profile, captureSnapshot());
  applySnapshot(next);
  pushHistory();
  emitMoshResult(describeMoshResult(next, profile));
  trackEvent("home", "randomized", {
    details: { method: recipe.ditherMethod, modes: recipe.modes, is_color: recipe.isColor, palette: next.palette?.id ?? null },
  });
};

export const handleMoshAction = (): void => {
  emitMoshRoll();
  playRollSound().catch((err: unknown) => {
    console.error("randomize sound failed:", err);
  });
  runMosh().catch((err: unknown) => {
    console.error("randomize failed:", err);
  });
};

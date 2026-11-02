import { applySnapshot, captureSnapshot } from "../../../store/transform-store";
import { pushHistory } from "../../../store/history-store";
import { imageSignal } from "../../../store/image-store";
import { trackEvent as trackPosthog } from "../../../lib/analytics";
import { trackEvent } from "../../../lib/tracker";
import { buildMoshSnapshot } from "./build-mosh-snapshot";
import { getImageProfile } from "./analysis/get-image-profile";
import { MOSH_RECIPES } from "./mosh-recipes";
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
  trackPosthog("mosh_randomized", {
    new_modes: recipe.modes,
    new_dither_method: recipe.ditherMethod,
    is_color: recipe.isColor,
    base_recipe_index: MOSH_RECIPES.indexOf(recipe),
  });
  trackEvent("home", "randomized", {
    details: { method: recipe.ditherMethod, is_color: recipe.isColor, palette: next.palette?.id ?? null },
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

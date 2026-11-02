import { isColorSignal, modesSignal } from "../../state/transform-store";
import { pushHistory } from "../../state/history-store";
import { trackEvent } from "@bitgrain/platform/tracker";
import type { TransformMode } from "@bitgrain/engine/core/types";
import { selectMainEffect } from "../effects/select-main-effect";
import { withoutMode } from "../effects/main-effect-modes";
import { HAZE_MODE } from "@bitgrain/engine/utils/haze-order";

const GRAIN_MODE: TransformMode = "grain";
const ORIGINAL_MODE: TransformMode = "original";

const mainEffectToggle = (effect: TransformMode, eventName: string): (() => void) => (): void => {
  const enabled = !modesSignal.value.includes(effect);
  selectMainEffect(enabled ? effect : ORIGINAL_MODE);
  pushHistory();
  trackEvent("home", eventName, { details: { enabled } });
};

const toggleHazeBloom = (): void => {
  const modes = modesSignal.value;
  const enabled = !modes.includes(HAZE_MODE);
  modesSignal.value = enabled ? [HAZE_MODE, ...modes] : withoutMode(modes, HAZE_MODE);
  pushHistory();
  trackEvent("home", "haze_bloom_toggled", { details: { enabled } });
};

const toggleFilmGrain = (): void => {
  const modes = modesSignal.value;
  const enabled = !modes.includes(GRAIN_MODE);
  const withoutGrain = modes.filter((mode) => mode !== GRAIN_MODE);
  const fallback: TransformMode[] = withoutGrain.length > 0 ? withoutGrain : [ORIGINAL_MODE];
  modesSignal.value = enabled ? [GRAIN_MODE, ...modes] : fallback;
  pushHistory();
  trackEvent("home", "film_grain_toggled", { details: { enabled } });
};

const toggleIsColor = (): void => {
  const enabled = !isColorSignal.value;
  isColorSignal.value = enabled;
  trackEvent("home", "colorize_toggle", { details: { enabled } });
};

const selectDither = (): void => {
  selectMainEffect("dither");
  pushHistory();
  trackEvent("home", "dither_selected");
};

export const EFFECT_TOGGLES = {
  toggleHalftone: mainEffectToggle("halftone", "halftone_toggled"),
  togglePopart: mainEffectToggle("popart", "popart_toggled"),
  toggleInkwash: mainEffectToggle("inkwash", "inkwash_toggled"),
  toggleManga: mainEffectToggle("manga", "manga_toggled"),
  toggleAscii: mainEffectToggle("ascii", "ascii_toggled"),
  toggleBraille: mainEffectToggle("braille", "braille_toggled"),
  toggleContour: mainEffectToggle("contour", "contour_toggled"),
  toggleHazeBloom,
  toggleFilmGrain,
  toggleIsColor,
  selectDither,
};

import { applySnapshot, captureSnapshot } from "../../store/transform-store";
import { pushHistory } from "../../store/history-store";
import { trackEvent as trackPosthog } from "../../lib/analytics";
import { trackEvent } from "../../lib/tracker";
import { MOSH_RECIPES } from "./mosh-recipes";

const HUE_JITTER_RANGE = 15;
const CONTRAST_JITTER = 0.1;
const BRIGHTNESS_JITTER = 0.04;
const SATURATION_JITTER = 0.12;
const MIN_CONTRAST = 1.0;
const MIN_BRIGHTNESS = 0.8;
const MAX_BRIGHTNESS = 1.2;

const jitter = (v: number, range: number): number =>
  Math.round((v + (Math.random() * 2 - 1) * range) * 100) / 100;

export const handleMoshAction = (): void => {
  const base = MOSH_RECIPES[Math.floor(Math.random() * MOSH_RECIPES.length)];
  const snap = captureSnapshot();
  applySnapshot({
    ...snap,
    modes: base.modes,
    ditherMethod: base.ditherMethod,
    ditherFactor: base.ditherFactor,
    resolution: base.resolution,
    contrast: Math.max(MIN_CONTRAST, jitter(base.contrast, CONTRAST_JITTER)),
    brightness: Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, jitter(base.brightness, BRIGHTNESS_JITTER))),
    saturation: Math.max(0, jitter(base.saturation, SATURATION_JITTER)),
    grain: base.grain,
    hue:
      base.hue !== 0
        ? (base.hue + Math.floor((Math.random() * 2 - 1) * HUE_JITTER_RANGE) + 360) % 360
        : 0,
    isColor: base.isColor,
    palette: null,
    lutId: null,
    asciiCharset: base.asciiCharset ?? snap.asciiCharset,
    asciiTone: base.asciiTone ?? snap.asciiTone,
    asciiDensity: base.asciiDensity ?? snap.asciiDensity,
    asciiEdges: base.asciiEdges ?? snap.asciiEdges,
    asciiEdgeThreshold: base.asciiEdgeThreshold ?? snap.asciiEdgeThreshold,
    halftoneCell: base.halftoneCell ?? snap.halftoneCell,
    halftoneAngle: base.halftoneAngle ?? snap.halftoneAngle,
    halftoneStyle: base.halftoneStyle ?? snap.halftoneStyle,
    popartThreshold: base.popartThreshold ?? snap.popartThreshold,
    contourLevels: base.contourLevels ?? snap.contourLevels,
    contourFill: base.contourFill ?? snap.contourFill,
  });
  pushHistory();
  trackPosthog("mosh_randomized", {
    new_modes: base.modes,
    new_dither_method: base.ditherMethod,
    is_color: base.isColor,
    base_recipe_index: MOSH_RECIPES.indexOf(base),
  });
  trackEvent("home", "randomized", {
    details: { method: base.ditherMethod, is_color: base.isColor },
  });
};

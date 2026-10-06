import { useEffect } from "react";
import { emitTutorial } from "../../lib/tutorial-event-bus";
import { undoHistory, redoHistory, resetHistory } from "../../store/history-store";
import {
  captureSnapshot,
  applySnapshot,
  type TransformSnapshot,
} from "../../store/transform-store";
import { decodePresetFromUrl, clearPresetFromUrl } from "../../utils/preset-url";
import { decodeRecipeFromUrl, clearRecipeFromUrl } from "../../utils/recipe-url";
import { PALETTES } from "../../engine/palettes";
import { isMobileNow } from "../../hooks/useIsMobile";

const TUTORIAL_DELAY_MS = 1000;
const TUTORIAL_KEY = "imgi_tutorial_home_done";

export const useHomeInit = (): void => {
  useEffect(() => {
    if (isMobileNow()) return;
    const done = localStorage.getItem(TUTORIAL_KEY);
    if (!done) {
      const timer = setTimeout(
        () => emitTutorial({ type: "start", tutorialId: "home" }),
        TUTORIAL_DELAY_MS,
      );
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyR") {
        e.preventDefault();
        window.location.reload();
        return;
      }
      const inEditableField = (e.target as HTMLElement | null)?.closest(
        "input, textarea, [contenteditable]",
      );
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyZ") {
        if (inEditableField) return;
        e.preventDefault();
        if (e.shiftKey) redoHistory();
        else undoHistory();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyY") {
        if (inEditableField) return;
        e.preventDefault();
        redoHistory();
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // No image is auto-restored on mount. Each darkroom tab is its own instance and
  // starts blank; previously worked-on documents live in the Home library and are
  // reopened explicitly, never resurrected into a fresh tab.

  useEffect(() => {
    const recipe = decodeRecipeFromUrl();
    if (recipe) {
      applySnapshot({ ...captureSnapshot(), ...recipe } as TransformSnapshot);
      clearRecipeFromUrl();
      resetHistory();
      return;
    }
    const shared = decodePresetFromUrl();
    if (!shared) return;
    const current = captureSnapshot();
    applySnapshot({
      ...current,
      modes: shared.modes,
      ditherMethod: shared.ditherMethod,
      ditherFactor: shared.ditherFactor,
      resolution: shared.resolution,
      contrast: shared.contrast,
      brightness: shared.brightness,
      saturation: shared.saturation,
      grain: shared.grain,
      hue: shared.hue,
      isColor: shared.isColor,
      palette: PALETTES.find((p) => p.id === shared.paletteId) ?? null,
    });
    clearPresetFromUrl();
    resetHistory();
  }, []);
};

import { useEffect } from "react";
import { closePalette, openPalette, paletteOpenSignal } from "./palette-store";

const PALETTE_KEY = "k";

const isPaletteShortcut = (event: KeyboardEvent): boolean =>
  (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === PALETTE_KEY;

export const usePaletteShortcut = (): void => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!isPaletteShortcut(event)) return;
      event.preventDefault();
      if (paletteOpenSignal.value) closePalette();
      else openPalette("shortcut");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
};

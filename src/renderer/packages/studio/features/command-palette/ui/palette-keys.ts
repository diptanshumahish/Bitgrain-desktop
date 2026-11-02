import type React from "react";
import type { PaletteEntry } from "../entries/palette-entry";
import { closePalette, moveActiveIndex, paletteActiveIndexSignal } from "../state/palette-store";
import { runPaletteEntry } from "./run-palette-entry";

export const handlePaletteKey = (event: React.KeyboardEvent, results: PaletteEntry[]): void => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    moveActiveIndex(event.key === "ArrowDown" ? 1 : -1, results.length);
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    const entry = results[paletteActiveIndexSignal.value];
    if (entry) runPaletteEntry(entry);
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    closePalette();
  }
};

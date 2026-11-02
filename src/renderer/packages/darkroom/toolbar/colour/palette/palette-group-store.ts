import { signal } from "@bitgrain/core/signal";
import type { Palette } from "@bitgrain/engine/core/types";
import { PALETTE_GROUPS } from "./palette-groups";

const DEFAULT_GROUP = PALETTE_GROUPS[0].title;

export const paletteGroupSignal = signal<string>(DEFAULT_GROUP);

export const groupOfPalette = (palette: Palette | null): string | null =>
  PALETTE_GROUPS.find((group) => group.palettes.some((entry) => entry.id === palette?.id))?.title ?? null;

export const selectPaletteGroup = (title: string): void => {
  paletteGroupSignal.value = title;
};

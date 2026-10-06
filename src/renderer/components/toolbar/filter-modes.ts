import type { TransformMode } from "../../engine/types";

export interface FilterEntry {
  id: TransformMode;
  label: string;
  glyph: string;
}

export const FILTER_ENTRIES: FilterEntry[] = [
  { id: "invert", label: "Invert", glyph: "¬~¬~" },
  { id: "grayscale", label: "Grayscale", glyph: "░▒▓░" },
  { id: "pixelate", label: "Pixelate", glyph: "▪▫▪▫" },
  { id: "blocky", label: "Blocky", glyph: "▀▄▀▄" },
  { id: "dot-matrix", label: "Dot matrix", glyph: "⠿⠿⠿" },
  { id: "posterize", label: "Posterize", glyph: "▁▃▅▇" },
  { id: "duotone", label: "Duotone", glyph: "◐◑◐" },
  { id: "colorgrade", label: "Warm grade", glyph: "◔◔◔" },
  { id: "colorwash", label: "Color wash", glyph: "≋≋≋" },
  { id: "vignette", label: "Vignette", glyph: "◌●◌" },
  { id: "sharpen", label: "Sharpen", glyph: "△▲△" },
];

const FILTER_IDS: ReadonlySet<TransformMode> = new Set(FILTER_ENTRIES.map((entry) => entry.id));

export function isFilterMode(mode: TransformMode): boolean {
  return FILTER_IDS.has(mode);
}

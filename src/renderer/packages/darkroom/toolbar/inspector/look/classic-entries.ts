import type { TransformMode } from "@bitgrain/engine/core/types";
import type { ActivePopover } from "../../toolbar-types";

interface ClassicEntry {
  mode: TransformMode;
  label: string;
  hint: string;
  glyph: string;
  panel: ActivePopover;
}

export const CLASSIC_ENTRIES: readonly ClassicEntry[] = [
  { mode: "original", label: "Original", hint: "No effect, just your photo", glyph: "□", panel: null },
  { mode: "dither", label: "Dither", hint: "Our print dither with palettes", glyph: "▒", panel: "algorithm" },
  { mode: "halftone", label: "Halftone", hint: "Print screens with SVG export", glyph: "∷", panel: "halftone" },
  { mode: "popart", label: "Pop art", hint: "Comic dot ink", glyph: "◉", panel: "popart" },
  { mode: "contour", label: "Contour", hint: "Map style lines", glyph: "≈", panel: "contour" },
  { mode: "inkwash", label: "Ink wash", hint: "Soft wash, inked lines", glyph: "◗", panel: "inkwash" },
  { mode: "manga", label: "Manga", hint: "Screentone and ink", glyph: "▨", panel: "manga" },
];

const LEGACY_PANELS: Partial<Record<TransformMode, ActivePopover>> = { ascii: "ascii", braille: "braille" };

export const classicPanelFor = (mode: TransformMode): ActivePopover =>
  CLASSIC_ENTRIES.find((entry) => entry.mode === mode)?.panel ?? LEGACY_PANELS[mode] ?? null;

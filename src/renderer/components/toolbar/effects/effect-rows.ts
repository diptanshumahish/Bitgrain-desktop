import type { ToolbarState } from "../use-toolbar-state";
import type { ActivePopover } from "../DesktopToolbar";
import { selectMainEffect } from "./select-main-effect";

export type EffectGroupName = "Start" | "Print" | "Comic & text" | "Line & ink";

export interface EffectRow {
  key: string;
  group: EffectGroupName;
  label: string;
  hint: string;
  glyph: string;
  active: boolean;
  select: () => void;
}

export const EFFECT_GROUP_ORDER: EffectGroupName[] = ["Start", "Print", "Comic & text", "Line & ink"];

const NEUTRAL = 1;

const resetToOriginal = (s: ToolbarState): void => {
  selectMainEffect("original");
  s.setContrast(NEUTRAL);
  s.setBrightness(NEUTRAL);
  s.setSaturation(NEUTRAL);
  s.setHue(0);
  s.setGrain(0);
  s.onDone();
};

const applyAndOpen = (isActive: boolean, enable: () => void, open: () => void): void => {
  if (!isActive) enable();
  open();
};

export const buildEffectRows = (
  s: ToolbarState,
  openPanel: (key: ActivePopover) => void,
  closeMenu: () => void,
): EffectRow[] => [
  {
    key: "original", group: "Start", label: "original", hint: "no effect, just your photo", glyph: "□",
    active: s.mode.includes("original"),
    select: () => { resetToOriginal(s); closeMenu(); },
  },
  {
    key: "algorithm", group: "Print", label: "dither", hint: "tone made of fine pixels", glyph: "▒",
    active: s.mode.includes("dither"),
    select: () => applyAndOpen(s.mode.includes("dither"), s.selectDither, () => openPanel("algorithm")),
  },
  {
    key: "halftone", group: "Print", label: "halftone", hint: "newspaper print dots", glyph: "∷",
    active: s.isHalftoneActive,
    select: () => applyAndOpen(s.isHalftoneActive, s.toggleHalftone, () => openPanel("halftone")),
  },
  {
    key: "popart", group: "Comic & text", label: "pop art", hint: "comic dot ink", glyph: "◉",
    active: s.isPopartActive,
    select: () => applyAndOpen(s.isPopartActive, s.togglePopart, () => openPanel("popart")),
  },
  {
    key: "ascii", group: "Comic & text", label: "ascii", hint: "letters as tone", glyph: "@",
    active: s.isAsciiActive,
    select: () => applyAndOpen(s.isAsciiActive, s.toggleAscii, () => openPanel("ascii")),
  },
  {
    key: "braille", group: "Comic & text", label: "braille", hint: "tiny dot detail", glyph: "⠿",
    active: s.isBrailleActive,
    select: () => applyAndOpen(s.isBrailleActive, s.toggleBraille, () => openPanel("braille")),
  },
  {
    key: "contour", group: "Line & ink", label: "contour", hint: "map-style lines", glyph: "≈",
    active: s.isContourActive,
    select: () => applyAndOpen(s.isContourActive, s.toggleContour, () => openPanel("contour")),
  },
  {
    key: "inkwash", group: "Line & ink", label: "ink wash", hint: "soft wash, inked lines", glyph: "◗",
    active: s.isInkwashActive,
    select: () => applyAndOpen(s.isInkwashActive, s.toggleInkwash, () => openPanel("inkwash")),
  },
  {
    key: "manga", group: "Line & ink", label: "manga", hint: "crosshatched ink", glyph: "▨",
    active: s.isMangaActive,
    select: () => applyAndOpen(s.isMangaActive, s.toggleManga, () => openPanel("manga")),
  },
];

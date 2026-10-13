import type { TransformMode } from "../../../engine/types";

const EFFECT_LABELS: Partial<Record<TransformMode, string>> = {
  dither: "dither",
  halftone: "halftone",
  popart: "pop art",
  ascii: "ascii",
  braille: "braille",
  contour: "contour",
  inkwash: "ink wash",
  manga: "manga",
};

const EFFECT_GLYPHS: Partial<Record<TransformMode, string>> = {
  dither: "▒▓░",
  halftone: "·∶∷▓",
  popart: "◍◍",
  ascii: "@%:",
  braille: "⠿⠦",
  contour: "◠◡",
  inkwash: "▟▖",
  manga: "▨▧",
};

const FALLBACK_LABEL = "effects";
const FALLBACK_GLYPH = "░▒▓";

export const currentEffectLabel = (modes: TransformMode[]): string => {
  const named = modes.find((mode) => EFFECT_LABELS[mode] !== undefined);
  return named ? EFFECT_LABELS[named] ?? FALLBACK_LABEL : FALLBACK_LABEL;
};

export const currentEffectGlyph = (modes: TransformMode[]): string => {
  const named = modes.find((mode) => EFFECT_GLYPHS[mode] !== undefined);
  return named ? EFFECT_GLYPHS[named] ?? FALLBACK_GLYPH : FALLBACK_GLYPH;
};

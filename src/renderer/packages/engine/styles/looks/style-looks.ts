import type { StyleLook } from "../engine/style-types";
import { BLOCK_LOOKS, BRAILLE_LOOKS, CHARACTERS_LOOKS, CROSS_LOOKS, DIAGONAL_LOOKS, DIAMOND_LOOKS, DOTS_LOOKS, LINES_LOOKS, MIXED_LOOKS } from "./glyph-looks";
import { DISCO_LOOKS, LEGO_LOOKS, MOSAIC_LOOKS, PIXEL_LOOKS, VOXEL_LOOKS } from "./tile-looks";
import { PRINT_LOOKS } from "../modes/print/print-styles";
import { SIGNAL_LOOKS } from "../modes/signal/signal-styles";
import { LIGHT_LOOKS } from "../modes/light/light-styles";
import { GEOMETRIC_LOOKS } from "../modes/geometric/geometric-styles";
import { DISTORT_LOOKS } from "../modes/distort/distort-styles";
import { GLASS_LOOKS } from "../modes/glass/glass-styles";
import { MATERIAL_LOOKS } from "../modes/material/material-styles";
import { STUDIO_LOOKS } from "../modes/studio/studio-styles";

const LOOKS_BY_STYLE: Readonly<Record<string, readonly StyleLook[]>> = {
  characters: CHARACTERS_LOOKS,
  mixed: MIXED_LOOKS,
  block: BLOCK_LOOKS,
  lines: LINES_LOOKS,
  diagonal: DIAGONAL_LOOKS,
  cross: CROSS_LOOKS,
  diamond: DIAMOND_LOOKS,
  dots: DOTS_LOOKS,
  braille: BRAILLE_LOOKS,
  mosaic: MOSAIC_LOOKS,
  pixel: PIXEL_LOOKS,
  voxel: VOXEL_LOOKS,
  lego: LEGO_LOOKS,
  disco: DISCO_LOOKS,
  ...STUDIO_LOOKS, ...PRINT_LOOKS, ...SIGNAL_LOOKS, ...LIGHT_LOOKS,
  ...GEOMETRIC_LOOKS, ...DISTORT_LOOKS, ...GLASS_LOOKS, ...MATERIAL_LOOKS,
};

const NO_LOOKS: readonly StyleLook[] = [];

export const looksFor = (styleId: string): readonly StyleLook[] => LOOKS_BY_STYLE[styleId] ?? NO_LOOKS;

import type { Preset } from "./presets/types";
import { ASCII_PRESETS } from "./presets/ascii-presets";
import { BRAILLE_PRESETS } from "./presets/braille-presets";
import { CONTOUR_PRESETS } from "./presets/contour-presets";
import { HALFTONE_PRESETS } from "./presets/halftone-presets";
import { CLASSIC_PRESETS } from "./presets/classic-presets";
import { PRINT_PRESETS } from "./presets/print-presets";
import { CINEMATIC_PRESETS } from "./presets/cinematic-presets";
import { COLOR_PRESETS } from "./presets/color-presets";
import { TEXTURE_PRESETS } from "./presets/texture-presets";
import { BRUTAL_PRESETS } from "./presets/brutal-presets";
import { GRAPHIC_PRESETS } from "./presets/graphic-presets";
import { SOFT_PRESETS } from "./presets/soft-presets";
import { NICHE_PRESETS } from "./presets/niche-presets";

export type { Preset, PresetConfig } from "./presets/types";
export { GOAL_PRESETS } from "./presets/goal-presets";

// Curated "best of the rest" — the strongest, most distinct of the older presets.
const KEEP_FROM_REST = new Set([
  "Newsprint", "CMYK Pop", "Cyanotype", "Noir", "Etching",
  "Synthwave", "Bleach Bypass", "Blueprint", "Posterize Max",
]);

const CURATED_REST: Preset[] = [
  ...HALFTONE_PRESETS,
  ...CLASSIC_PRESETS,
  ...PRINT_PRESETS,
  ...CINEMATIC_PRESETS,
  ...COLOR_PRESETS,
  ...TEXTURE_PRESETS,
  ...BRUTAL_PRESETS,
  ...GRAPHIC_PRESETS,
  ...SOFT_PRESETS,
  ...NICHE_PRESETS,
].filter((preset) => KEEP_FROM_REST.has(preset.name));

export const PRESETS: Preset[] = [
  ...ASCII_PRESETS,
  ...BRAILLE_PRESETS,
  ...CONTOUR_PRESETS,
  ...CURATED_REST,
];

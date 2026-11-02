import type { Preset } from "./types";
import { ASCII_PRESETS } from "./ascii-presets";
import { HALFTONE_PRESETS } from "./halftone-presets";
import { CLASSIC_PRESETS } from "./classic-presets";
import { PRINT_PRESETS } from "./print-presets";
import { CINEMATIC_PRESETS } from "./cinematic-presets";
import { COLOR_PRESETS } from "./color-presets";
import { TEXTURE_PRESETS } from "./texture-presets";
import { BRUTAL_PRESETS } from "./brutal-presets";
import { GRAPHIC_PRESETS } from "./graphic-presets";
import { SOFT_PRESETS } from "./soft-presets";
import { NICHE_PRESETS } from "./niche-presets";
import { PALETTE_PRESETS } from "./palette-presets";

export type { Preset, PresetConfig } from "./types";
export { GOAL_PRESETS } from "./goal-presets";

const KEEP_FROM_REST = new Set(["CMYK Pop", "Fine Colour"]);
const KEEP_TEXT = new Set(["Terminal", "Blocks"]);

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
  ...ASCII_PRESETS.filter((preset) => KEEP_TEXT.has(preset.name)),
  ...PALETTE_PRESETS,
  ...CURATED_REST,
];

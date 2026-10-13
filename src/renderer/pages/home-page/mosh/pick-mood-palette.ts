import { PALETTES } from "../../../engine/palettes";
import type { Palette } from "../../../engine/types";
import { DARK_LUMA, BRIGHT_LUMA, MUTED_SATURATION, VIVID_SATURATION, type ImageProfile } from "./analysis/image-profile";

const DARK_PALETTES = ["amber-crt", "green-crt", "neon", "noir", "vaporwave", "thermal"];
const BRIGHT_PALETTES = ["mono-cream", "sepia", "risograph", "cyanotype", "arctic", "gameboy-pocket"];
const VIVID_PALETTES = ["pico8", "c64", "sunset", "vaporwave", "nes", "msx"];
const MUTED_PALETTES = ["noir", "sepia", "vintage", "gameboy", "forest", "cyanotype"];
const BALANCED_PALETTES = ["gameboy", "duotone-magenta", "risograph", "pico8", "vintage", "zx-spectrum"];

const paletteIdsFor = (profile: ImageProfile): string[] => {
  if (profile.meanLuma < DARK_LUMA) return DARK_PALETTES;
  if (profile.meanLuma > BRIGHT_LUMA) return BRIGHT_PALETTES;
  if (profile.meanSaturation > VIVID_SATURATION) return VIVID_PALETTES;
  if (profile.meanSaturation < MUTED_SATURATION) return MUTED_PALETTES;
  return BALANCED_PALETTES;
};

export const pickMoodPalette = (profile: ImageProfile, currentId: string | null): Palette | null => {
  const ids = paletteIdsFor(profile).filter((id) => id !== currentId);
  const candidates = PALETTES.filter((palette) => ids.includes(palette.id));
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
};

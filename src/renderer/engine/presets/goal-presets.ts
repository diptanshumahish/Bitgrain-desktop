import type { Palette } from "../types";
import { PALETTES } from "../palettes";
import type { Preset, PresetConfig } from "./types";

const paletteById = (id: string): Palette | null => PALETTES.find((palette) => palette.id === id) ?? null;

const BASE: PresetConfig = {
  modes: ["dither"],
  ditherMethod: "atkinson",
  ditherFactor: 1,
  palette: null,
  resolution: 2,
  contrast: 1.1,
  brightness: 1,
  saturation: 1,
  grain: 0,
  hue: 0,
  isColor: true,
};

export const GOAL_PRESETS: Preset[] = [
  {
    name: "Album Cover",
    tag: "▣▢▣",
    config: { ...BASE, palette: paletteById("nes"), resolution: 1.4, contrast: 1.1 },
  },
  {
    name: "Risograph",
    tag: "●◎○",
    config: { ...BASE, palette: paletteById("risograph"), resolution: 1.4, contrast: 1.15, brightness: 1.05 },
  },
  {
    name: "Zine Print",
    tag: "░▒▓",
    config: { ...BASE, palette: paletteById("noir"), resolution: 1.3, contrast: 1.25, saturation: 0 },
  },
  {
    name: "Streetwear",
    tag: "X%&",
    config: { ...BASE, palette: paletteById("duotone-magenta"), resolution: 1.2, contrast: 1.35 },
  },
  {
    name: "Retro Game",
    tag: "▀▄▀",
    config: { ...BASE, ditherMethod: "bayer-4", palette: paletteById("pico8"), resolution: 0.6, contrast: 1.15, saturation: 1.2 },
  },
  {
    name: "Vaporwave",
    tag: "◈▷◈",
    config: { ...BASE, palette: paletteById("vaporwave"), resolution: 1.3, contrast: 1.1, brightness: 1.05 },
  },
  {
    name: "Darkroom",
    tag: "◐◑◒",
    config: { ...BASE, palette: paletteById("mono-cream"), resolution: 1.6, contrast: 1.25, saturation: 0 },
  },
  {
    name: "Golden Hour",
    tag: "☀▲◎",
    config: { ...BASE, palette: paletteById("sunset"), resolution: 1.5, contrast: 1.05, brightness: 1.05 },
  },
];

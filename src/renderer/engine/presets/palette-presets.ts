import type { Palette } from "../types";
import { PALETTES } from "../palettes";
import type { Preset, PresetConfig } from "./types";

const paletteById = (id: string): Palette | null => PALETTES.find((palette) => palette.id === id) ?? null;

const BASE: PresetConfig = {
  modes: ["dither"],
  ditherMethod: "atkinson",
  ditherFactor: 1,
  palette: null,
  resolution: 1.4,
  contrast: 1.1,
  brightness: 1,
  saturation: 1,
  grain: 0,
  hue: 0,
  isColor: true,
};

export const PALETTE_PRESETS: Preset[] = [
  { name: "Cyanotype", tag: "◒◓◒", config: { ...BASE, palette: paletteById("cyanotype") } },
  { name: "Game Boy", tag: "▚▞▚", config: { ...BASE, palette: paletteById("gameboy"), resolution: 0.9 } },
  { name: "Green Screen", tag: "▤▥▤", config: { ...BASE, palette: paletteById("green-crt") } },
  { name: "Forest Print", tag: "▲△▲", config: { ...BASE, palette: paletteById("forest") } },
  { name: "Old Photo", tag: "◐◑◐", config: { ...BASE, palette: paletteById("vintage"), contrast: 1.05 } },
];

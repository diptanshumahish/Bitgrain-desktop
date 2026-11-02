import type { StyleLook } from "../../../engine/style-types";
import { combine, grain, vignette } from "../../../looks/look-builders";
import { GRADIENT_PALETTES } from "../colour/gradient-palettes";

const SOFT_VIGNETTE = 30;
const DUOTONE_GRAIN = 18;
const DUOTONE_VIGNETTE = 32;

export const ANAGLYPH_LOOKS: readonly StyleLook[] = [
  { name: "Red and cyan", effects: vignette(SOFT_VIGNETTE) },
  { name: "Deep pop", params: { disparity: 80, focus: 40 }, effects: vignette(SOFT_VIGNETTE) },
  { name: "Green and magenta", params: { scheme: "greenmagenta", disparity: 55 }, effects: vignette(SOFT_VIGNETTE) },
  { name: "ChromaDepth", params: { scheme: "chromadepth" }, effects: vignette(SOFT_VIGNETTE) },
];

const paletteLooks: StyleLook[] = Object.entries(GRADIENT_PALETTES).map(([palette, entry]) => ({
  name: entry.label, params: { palette }, effects: vignette(SOFT_VIGNETTE),
}));

export const GRADIENT_MAP_LOOKS: readonly StyleLook[] = [
  ...paletteLooks,
  { name: "Poster", params: { palette: "sunset", bands: 6, rampContrast: 45 }, effects: vignette(SOFT_VIGNETTE) },
  { name: "Faded", params: { palette: "tealorange", mix: 60 }, effects: grain(DUOTONE_GRAIN) },
];

const duotoneLook = (name: string, shadow: string, highlight: string): StyleLook => ({
  name, params: { shadow, highlight }, effects: combine(grain(DUOTONE_GRAIN), vignette(DUOTONE_VIGNETTE)),
});

export const DUOTONE_LOOKS: readonly StyleLook[] = [
  duotoneLook("Amber", "#1a1636", "#f5c542"),
  duotoneLook("Rose", "#2a0d24", "#ff8fb2"),
  duotoneLook("Toxic", "#101a08", "#c8ff45"),
  duotoneLook("Mono", "#111111", "#f2f2f2"),
  duotoneLook("Ember", "#1c0a06", "#ff7a3c"),
];


import type { StyleLook } from "../../../../engine/style-types";
import { combine, grain, vignette } from "../../../../looks/look-builders";

const RISOGRAPH_LOOKS: readonly StyleLook[] = [
  { name: "Pink and blue", params: { print: "paper" }, effects: combine(grain(20), vignette(28)) },
  { name: "Glow screen", params: { print: "glow" }, effects: combine(grain(20), vignette(28)) },
  { name: "Misprint", params: { print: "paper", registration: 90, size: 14 }, effects: grain(24) },
  { name: "Fine screen", params: { print: "paper", size: 7, levels: 8, registration: 20 }, effects: grain(14) },
  { name: "Poster", params: { print: "paper", size: 18, levels: 3, separation: 260 }, effects: grain(18) },
];

const ENGRAVING_LOOKS: readonly StyleLook[] = [
  { name: "Banknote", params: { colour: "currency", spacing: 7 }, effects: vignette(34) },
  { name: "Etching", params: { colour: "ink", spacing: 6, wave: 30, contrast: 40 }, effects: vignette(34) },
  { name: "Night lines", params: { colour: "blueprint", wave: 50 }, effects: vignette(30) },
  { name: "Calm water", params: { colour: "mono", wave: 15, relief: 60, spacing: 8 } },
];

const CYANOTYPE_LOOKS: readonly StyleLook[] = [
  { name: "Sun print", params: { theme: "cyanotype" }, effects: vignette(30) },
  { name: "Draft", params: { theme: "draft", grid: 60 } },
  { name: "Night plan", params: { theme: "dark", grid: 70, detail: 65 }, effects: vignette(30) },
  { name: "Study", params: { theme: "light", grid: 30, grain: 30 } },
  { name: "Clean print", params: { theme: "cyanotype", grain: 0, grid: 0 } },
];

export const INK_STYLE_LOOKS: Readonly<Record<string, readonly StyleLook[]>> = {
  risograph: RISOGRAPH_LOOKS,
  engraving: ENGRAVING_LOOKS,
  blueprint: CYANOTYPE_LOOKS,
};

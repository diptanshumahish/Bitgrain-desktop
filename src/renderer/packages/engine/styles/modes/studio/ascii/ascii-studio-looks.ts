import type { StyleLook } from "../../../engine/style-types";
import { chromatic, combine, grain, scanlines, vignette } from "../../../looks/look-builders";
import { randomStudioParams } from "./studio-randomize";

const SHUFFLE_SEEDS = { wildcard: 17, luckyDip: 58, curveball: 91 } as const;

export const ASCII_STUDIO_LOOKS: readonly StyleLook[] = [
  { name: "Acid pop", params: { palette: "acidPop", glyphs: "chars", glow: 48 } },
  { name: "Print dots", params: { palette: "cmykShock", glyphs: "shapes", shapeSet: "rings", size: 10 }, effects: grain(18) },
  { name: "Yves", params: { palette: "yvesDots", glyphs: "shapes", shapeSet: "basic", mix: "interleave", size: 12 }, effects: scanlines(22) },
  { name: "Candy stars", params: { palette: "candyDots", glyphs: "shapes", shapeSet: "stars", size: 13, glow: 30 }, effects: chromatic(4) },
  { name: "Arcade", params: { palette: "toxicGreen", glyphs: "shapes", shapeSet: "arcade", mix: "checker", size: 14 }, effects: scanlines(22) },
  { name: "Blueprint", params: { palette: "blueprint", glyphs: "chars", ramp: "hacker", size: 9, glow: 36 } },
  { name: "Forensic", params: { palette: "source", glyphs: "chars", ramp: "forensic", size: 10, saturation: 30, glow: 40 }, effects: vignette(40) },
  { name: "Heat", params: { palette: "heat", glyphs: "chars", ramp: "blocks", size: 10, bandSpread: 18 }, effects: grain(18) },
  { name: "Own colours", params: { palette: "extract", glyphs: "shapes", shapeSet: "squares", mix: "noise", size: 12 } },
  { name: "Nested rings", params: { palette: "nightDots", glyphs: "shapes", shapeSet: "rings", mix: "stack", size: 16 }, effects: combine(grain(22), scanlines(16)) },
  { name: "Wildcard", params: randomStudioParams(SHUFFLE_SEEDS.wildcard) },
  { name: "Lucky dip", params: randomStudioParams(SHUFFLE_SEEDS.luckyDip), effects: grain(18) },
  { name: "Curveball", params: randomStudioParams(SHUFFLE_SEEDS.curveball), effects: scanlines(22) },
];

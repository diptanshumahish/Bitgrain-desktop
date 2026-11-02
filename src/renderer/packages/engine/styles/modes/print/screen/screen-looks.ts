import type { StyleLook } from "../../../engine/style-types";
import { bloom, chromatic, combine, grain, scanlines, vignette } from "../../../looks/look-builders";

const SOFT_PRINT = {
  type: "dots", gridNoise: 45, contrast: 125, softness: 40, cyanGain: 30, magentaGain: 0, yellowGain: 20, blackGain: 0,
  cyanFlood: 15, grainMix: 15, grainSize: 50, grain: 10,
  paper: "#fffaf0", cyan: "#59afc5", magenta: "#d8697c", yellow: "#fad85c", black: "#2d2824",
};

export const DITHER_LOOKS: readonly StyleLook[] = [
  { name: "Cyberpunk", params: { algorithm: "bayer8", palette: "cyberpunk", pixelSize: 2, contrast: 118 }, effects: combine(chromatic(3), bloom(32)) },
  { name: "Riso print", params: { algorithm: "halftone", palette: "riso", pixelSize: 1 }, effects: combine(vignette(36), grain(18)) },
  { name: "Game Boy", params: { algorithm: "bayer16", palette: "gameboy", pixelSize: 2 }, effects: combine(scanlines(22), vignette(35)) },
  { name: "Classic", params: { algorithm: "floyd", palette: "original", pixelSize: 2 }, effects: combine(vignette(40), grain(22)) },
  { name: "Mac paint", params: { algorithm: "atkinson", palette: "mono", pixelSize: 2 } },
  { name: "Pico", params: { algorithm: "blueNoise", palette: "pico8", pixelSize: 3 } },
];

export const HALFTONE_LOOKS: readonly StyleLook[] = [
  { name: "Newsprint", params: { size: 16 }, effects: combine(vignette(32), grain(16)) },
  { name: "Diamond", params: { shape: "diamond", angle: 45 } },
  { name: "Square grid", params: { shape: "square", angle: 0 } },
  { name: "Etched", params: { texture: "crosshatch", angle: 30 } },
  { name: "Rings", params: { texture: "rings", angle: 0, size: 18 } },
  { name: "Stars", params: { shape: "star5", angle: 20, size: 14 } },
  { name: "Full colour", params: { colour: "color" } },
];

export const MEZZOTINT_LOOKS: readonly StyleLook[] = [
  { name: "Grain", params: { type: "grain", colour: "source" }, effects: vignette(32) },
  { name: "Fine dots", params: { type: "dots", colour: "source" } },
  { name: "Strokes", params: { type: "strokes", colour: "saturated" } },
  { name: "Ink", params: { type: "lines", colour: "mono" } },
];

export const POINTILLIZE_LOOKS: readonly StyleLook[] = [
  { name: "Fine", params: { size: 8 }, effects: vignette(30) },
  { name: "Night garden", params: { size: 8, jitter: 41, fill: 87, background: "black" } },
  { name: "Seurat", params: { size: 10, fill: 95, background: "cream" } },
  { name: "Chunky", params: { size: 24, fill: 90, background: "white" } },
];

export const CROSSHATCH_LOOKS: readonly StyleLook[] = [
  { name: "Drafting", params: { palette: "drafting", contrast: 40 }, effects: combine(grain(22), vignette(36)) },
  { name: "Graphite", params: { palette: "graphite" } },
  { name: "Sepia", params: { palette: "sepia" }, effects: grain(16) },
  { name: "Oxblood", params: { palette: "oxblood" } },
  { name: "Newsprint", params: { palette: "newsprint" } },
  { name: "Chalkboard", params: { palette: "chalkboard" } },
  { name: "Blue line", params: { palette: "blueLine", angle: 30 } },
];

export const CMYK_LOOKS: readonly StyleLook[] = [
  { name: "Ink drops", params: {} },
  { name: "Soft print", params: { ...SOFT_PRINT, size: 20 } },
  { name: "Sharp print", params: { ...SOFT_PRINT, type: "sharp", size: 20 } },
  { name: "Coarse", params: { size: 60 }, effects: grain(14) },
];

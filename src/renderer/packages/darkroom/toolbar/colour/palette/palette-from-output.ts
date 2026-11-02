import type { Palette } from "@bitgrain/engine/core/types";
import { extractPalette } from "@bitgrain/engine/analysis/color-analysis";

const OUTPUT_CANVAS_ID = "transformation-output-canvas";
const SAMPLE_COLOURS = 8;
const HEX_RADIX = 16;
const RED_SLICE: [number, number] = [1, 3];
const GREEN_SLICE: [number, number] = [3, 5];
const BLUE_SLICE: [number, number] = [5, 7];

const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(...RED_SLICE), HEX_RADIX),
  parseInt(hex.slice(...GREEN_SLICE), HEX_RADIX),
  parseInt(hex.slice(...BLUE_SLICE), HEX_RADIX),
];

export const paletteFromOutput = (): Palette | null => {
  const canvas = document.getElementById(OUTPUT_CANVAS_ID);
  if (!(canvas instanceof HTMLCanvasElement)) return null;
  return {
    id: `aura-${Date.now()}`,
    name: "From your photo",
    colors: extractPalette(canvas, SAMPLE_COLOURS).map(hexToRgb),
  };
};

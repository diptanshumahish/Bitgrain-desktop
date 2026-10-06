import type { Preset } from "./types";

export const BRAILLE_PRESETS: Preset[] = [
  {
    name: "Braille",
    tag: "⠿⠦",
    config: {
      modes: ["braille"], ditherMethod: "floyd-steinberg", ditherFactor: 1, palette: null,
      resolution: 2, contrast: 1.25, brightness: 1.05, saturation: 1.2, grain: 0, hue: 0, isColor: true,
      asciiDensity: 1,
    },
  },
  {
    name: "Braille Ink",
    tag: "⠛⠿",
    config: {
      modes: ["braille"], ditherMethod: "floyd-steinberg", ditherFactor: 1, palette: null,
      resolution: 2, contrast: 1.5, brightness: 1.0, saturation: 0, grain: 0, hue: 0, isColor: false,
      asciiDensity: 1.4,
    },
  },
  {
    name: "Braille Fine",
    tag: "⠁⠿",
    config: {
      modes: ["braille"], ditherMethod: "floyd-steinberg", ditherFactor: 1, palette: null,
      resolution: 2, contrast: 1.3, brightness: 1.05, saturation: 1.3, grain: 0, hue: 0, isColor: true,
      asciiDensity: 2,
    },
  },
];

import type { Preset } from "./types";

export const NICHE_PRESETS: Preset[] = [
  {
    name: "Thermal Scan",
    tag: "▓▓▓",
    config: {
      modes: ["dither"],
      ditherMethod: "blue-noise",
      ditherFactor: 0.95,
      palette: null,
      resolution: 2.0,
      contrast: 1.6,
      brightness: 1.1,
      saturation: 2.0,
      grain: 0.02,
      hue: 20,
      isColor: true,
    },
  },
  {
    name: "Acid Trip",
    tag: "☢☢☢",
    config: {
      modes: ["dither"],
      ditherMethod: "random",
      ditherFactor: 1.1,
      palette: null,
      resolution: 2.0,
      contrast: 1.5,
      brightness: 1.05,
      saturation: 2.0,
      grain: 0.05,
      hue: 90,
      isColor: true,
    },
  },
];

import type { Preset } from "./types";

export const CONTOUR_PRESETS: Preset[] = [
  {
    name: "Topographic",
    tag: "◠◡",
    config: {
      modes: ["contour"], ditherMethod: "floyd-steinberg", ditherFactor: 1, palette: null,
      resolution: 2.0, contrast: 1.3, brightness: 1.0, saturation: 0, grain: 0.02, hue: 0, isColor: false,
      contourLevels: 11, contourFill: false,
    },
  },
  {
    name: "Relief Map",
    tag: "▤▥",
    config: {
      modes: ["contour"], ditherMethod: "floyd-steinberg", ditherFactor: 1, palette: null,
      resolution: 2.0, contrast: 1.3, brightness: 1.0, saturation: 1.2, grain: 0, hue: 0, isColor: true,
      contourLevels: 8, contourFill: true,
    },
  },
];

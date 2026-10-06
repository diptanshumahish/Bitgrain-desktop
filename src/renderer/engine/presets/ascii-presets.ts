import type { Preset } from "./types";
import { ASCII_DETAILED, ASCII_CODE, ASCII_STANDARD, ASCII_BLOCKS } from "../plugins/ascii";

export const ASCII_PRESETS: Preset[] = [
  {
    name: "Terminal",
    tag: "@%:",
    config: {
      modes: ["ascii"], ditherMethod: "floyd-steinberg", ditherFactor: 1, palette: null,
      resolution: 2, contrast: 1.35, brightness: 1.05, saturation: 1.2, grain: 0, hue: 0, isColor: true,
      asciiCharset: ASCII_DETAILED, asciiTone: "dark", asciiDensity: 1, asciiEdges: false, asciiEdgeThreshold: 0.5,
    },
  },
  {
    name: "Edge Trace",
    tag: "/\\|",
    config: {
      modes: ["ascii"], ditherMethod: "floyd-steinberg", ditherFactor: 1, palette: null,
      resolution: 2, contrast: 1.5, brightness: 1.0, saturation: 0, grain: 0, hue: 0, isColor: false,
      asciiCharset: ASCII_DETAILED, asciiTone: "dark", asciiDensity: 1.1, asciiEdges: true, asciiEdgeThreshold: 0.62,
    },
  },
  {
    name: "Code Rain",
    tag: "01z",
    config: {
      modes: ["ascii"], ditherMethod: "floyd-steinberg", ditherFactor: 1, palette: null,
      resolution: 2, contrast: 1.4, brightness: 1.0, saturation: 1.5, grain: 0, hue: 130, isColor: true,
      asciiCharset: ASCII_CODE, asciiTone: "dark", asciiDensity: 1.25, asciiEdges: false, asciiEdgeThreshold: 0.5,
    },
  },
  {
    name: "Ink Type",
    tag: "Mw#",
    config: {
      modes: ["ascii"], ditherMethod: "floyd-steinberg", ditherFactor: 1, palette: null,
      resolution: 2, contrast: 1.5, brightness: 1.0, saturation: 0, grain: 0, hue: 0, isColor: false,
      asciiCharset: ASCII_DETAILED, asciiTone: "light", asciiDensity: 1.2, asciiEdges: false, asciiEdgeThreshold: 0.5,
    },
  },
  {
    name: "Blocks",
    tag: "░▒▓",
    config: {
      modes: ["ascii"], ditherMethod: "floyd-steinberg", ditherFactor: 1, palette: null,
      resolution: 2, contrast: 1.2, brightness: 1.05, saturation: 1.3, grain: 0, hue: 0, isColor: true,
      asciiCharset: ASCII_BLOCKS, asciiTone: "dark", asciiDensity: 1, asciiEdges: false, asciiEdgeThreshold: 0.5,
    },
  },
  {
    name: "Fine Print",
    tag: ".:-",
    config: {
      modes: ["ascii"], ditherMethod: "floyd-steinberg", ditherFactor: 1, palette: null,
      resolution: 2, contrast: 1.45, brightness: 1.0, saturation: 0, grain: 0, hue: 0, isColor: false,
      asciiCharset: ASCII_STANDARD, asciiTone: "dark", asciiDensity: 1.8, asciiEdges: false, asciiEdgeThreshold: 0.5,
    },
  },
  {
    name: "Wireframe",
    tag: "|/-",
    config: {
      modes: ["ascii"], ditherMethod: "floyd-steinberg", ditherFactor: 1, palette: null,
      resolution: 2, contrast: 1.6, brightness: 1.0, saturation: 1.1, grain: 0, hue: 0, isColor: true,
      asciiCharset: ASCII_STANDARD, asciiTone: "dark", asciiDensity: 1, asciiEdges: true, asciiEdgeThreshold: 0.72,
    },
  },
];

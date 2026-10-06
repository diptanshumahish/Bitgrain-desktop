import type { TransformMode, DitherMethod, AsciiTone } from "../../engine/types";
import { ASCII_DETAILED, ASCII_CODE, ASCII_BLOCKS } from "../../engine/plugins/ascii";

export interface MoshRecipe {
  resolution: number;
  contrast: number;
  brightness: number;
  saturation: number;
  modes: TransformMode[];
  ditherMethod: DitherMethod;
  ditherFactor: number;
  isColor: boolean;
  grain: number;
  hue: number;
  asciiCharset?: string;
  asciiTone?: AsciiTone;
  asciiDensity?: number;
  asciiEdges?: boolean;
  asciiEdgeThreshold?: number;
  halftoneCell?: number;
  halftoneAngle?: number;
  halftoneStyle?: 'mono' | 'color' | 'cmyk';
  popartThreshold?: number;
  contourLevels?: number;
  contourFill?: boolean;
}

export const MOSH_RECIPES: MoshRecipe[] = [
  // ── Dither ──
  { resolution: 2.0, contrast: 1.15, brightness: 0.95, saturation: 0.75, modes: ["dither"], ditherMethod: "atkinson", ditherFactor: 0.95, isColor: true, grain: 0, hue: 9 },
  { resolution: 2.0, contrast: 1.5, brightness: 1.05, saturation: 2.0, modes: ["dither"], ditherMethod: "bayer-8", ditherFactor: 1.0, isColor: true, grain: 0, hue: 22 },
  { resolution: 2.0, contrast: 2.1, brightness: 0.97, saturation: 0.0, modes: ["dither"], ditherMethod: "floyd-steinberg", ditherFactor: 1.05, isColor: false, grain: 0, hue: 0 },
  { resolution: 1.8, contrast: 2.3, brightness: 0.88, saturation: 0.0, modes: ["dither"], ditherMethod: "bayer-4", ditherFactor: 1.1, isColor: false, grain: 0, hue: 0 },
  { resolution: 2.0, contrast: 1.65, brightness: 1.0, saturation: 1.8, modes: ["dither"], ditherMethod: "bayer-2", ditherFactor: 0.9, isColor: true, grain: 0, hue: 0 },
  { resolution: 2.0, contrast: 1.35, brightness: 1.05, saturation: 2.2, modes: ["dither"], ditherMethod: "blue-noise", ditherFactor: 1.0, isColor: true, grain: 0, hue: 290 },
  { resolution: 2.0, contrast: 1.6, brightness: 1.05, saturation: 1.9, modes: ["dither"], ditherMethod: "atkinson", ditherFactor: 1.05, isColor: true, grain: 0, hue: 0 },
  { resolution: 2.0, contrast: 1.55, brightness: 0.9, saturation: 0.12, modes: ["dither"], ditherMethod: "atkinson", ditherFactor: 0.9, isColor: false, grain: 0, hue: 10 },
  { resolution: 2.0, contrast: 1.6, brightness: 1.0, saturation: 2.2, modes: ["dither"], ditherMethod: "sierra", ditherFactor: 1.0, isColor: true, grain: 0, hue: 120 },
  { resolution: 2.0, contrast: 1.45, brightness: 1.0, saturation: 0.0, modes: ["dither"], ditherMethod: "stucki", ditherFactor: 1.0, isColor: false, grain: 0, hue: 0 },
  { resolution: 2.0, contrast: 2.0, brightness: 1.0, saturation: 0.0, modes: ["dither"], ditherMethod: "threshold", ditherFactor: 1.0, isColor: false, grain: 0, hue: 0 },

  // ── ASCII ──
  { resolution: 2.0, contrast: 1.4, brightness: 1.05, saturation: 1.3, modes: ["ascii"], ditherMethod: "atkinson", ditherFactor: 1, isColor: true, grain: 0, hue: 0, asciiCharset: ASCII_DETAILED, asciiTone: "dark", asciiDensity: 1 },
  { resolution: 2.0, contrast: 1.55, brightness: 1.0, saturation: 0, modes: ["ascii"], ditherMethod: "atkinson", ditherFactor: 1, isColor: false, grain: 0, hue: 0, asciiCharset: ASCII_DETAILED, asciiTone: "dark", asciiDensity: 1.1, asciiEdges: true, asciiEdgeThreshold: 0.62 },
  { resolution: 2.0, contrast: 1.4, brightness: 1.0, saturation: 1.6, modes: ["ascii"], ditherMethod: "atkinson", ditherFactor: 1, isColor: true, grain: 0, hue: 130, asciiCharset: ASCII_CODE, asciiTone: "dark", asciiDensity: 1.25 },
  { resolution: 2.0, contrast: 1.5, brightness: 1.0, saturation: 0, modes: ["ascii"], ditherMethod: "atkinson", ditherFactor: 1, isColor: false, grain: 0, hue: 0, asciiCharset: ASCII_DETAILED, asciiTone: "light", asciiDensity: 1.2 },
  { resolution: 2.0, contrast: 1.2, brightness: 1.05, saturation: 1.3, modes: ["ascii"], ditherMethod: "atkinson", ditherFactor: 1, isColor: true, grain: 0, hue: 0, asciiCharset: ASCII_BLOCKS, asciiTone: "dark", asciiDensity: 1 },

  // ── Braille ──
  { resolution: 2.0, contrast: 1.3, brightness: 1.05, saturation: 1.2, modes: ["braille"], ditherMethod: "atkinson", ditherFactor: 1, isColor: true, grain: 0, hue: 0, asciiDensity: 1 },
  { resolution: 2.0, contrast: 1.5, brightness: 1.0, saturation: 0, modes: ["braille"], ditherMethod: "atkinson", ditherFactor: 1, isColor: false, grain: 0, hue: 0, asciiDensity: 1.5 },
  { resolution: 2.0, contrast: 1.3, brightness: 1.05, saturation: 1.4, modes: ["braille"], ditherMethod: "atkinson", ditherFactor: 1, isColor: true, grain: 0, hue: 0, asciiDensity: 2 },

  // ── Halftone ──
  { resolution: 2.0, contrast: 1.3, brightness: 1.05, saturation: 1.4, modes: ["halftone"], ditherMethod: "atkinson", ditherFactor: 1, isColor: true, grain: 0, hue: 0, halftoneCell: 7, halftoneAngle: 15, halftoneStyle: "cmyk" },
  { resolution: 2.0, contrast: 1.45, brightness: 1.0, saturation: 0, modes: ["halftone"], ditherMethod: "atkinson", ditherFactor: 1, isColor: false, grain: 0, hue: 0, halftoneCell: 6, halftoneAngle: 45, halftoneStyle: "mono" },
  { resolution: 2.0, contrast: 1.3, brightness: 1.05, saturation: 1.8, modes: ["halftone"], ditherMethod: "atkinson", ditherFactor: 1, isColor: true, grain: 0, hue: 0, halftoneCell: 10, halftoneAngle: 0, halftoneStyle: "color" },
  { resolution: 2.0, contrast: 1.5, brightness: 1.0, saturation: 0, modes: ["halftone"], ditherMethod: "atkinson", ditherFactor: 1, isColor: false, grain: 0, hue: 0, halftoneCell: 4, halftoneAngle: 30, halftoneStyle: "mono" },

  // ── Pop art ──
  { resolution: 2.0, contrast: 1.4, brightness: 1.0, saturation: 1.6, modes: ["popart"], ditherMethod: "atkinson", ditherFactor: 1, isColor: true, grain: 0, hue: 0, popartThreshold: 0.5 },
  { resolution: 2.0, contrast: 1.5, brightness: 1.0, saturation: 1.4, modes: ["popart"], ditherMethod: "atkinson", ditherFactor: 1, isColor: true, grain: 0, hue: 0, popartThreshold: 0.62 },

  // ── Contour ──
  { resolution: 2.0, contrast: 1.3, brightness: 1.0, saturation: 0, modes: ["contour"], ditherMethod: "atkinson", ditherFactor: 1, isColor: false, grain: 0.02, hue: 0, contourLevels: 11, contourFill: false },
  { resolution: 2.0, contrast: 1.3, brightness: 1.0, saturation: 1.3, modes: ["contour"], ditherMethod: "atkinson", ditherFactor: 1, isColor: true, grain: 0, hue: 0, contourLevels: 8, contourFill: true },
];

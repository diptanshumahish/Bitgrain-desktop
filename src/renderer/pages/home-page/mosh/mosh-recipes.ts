import type { HalftoneShape } from "../../../engine/plugins/halftone/halftone-defaults";
import type { TransformMode, DitherMethod, AsciiTone } from "../../../engine/types";
import { ASCII_DETAILED, ASCII_CODE, ASCII_BLOCKS } from "../../../engine/plugins/ascii";

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
  usesPalette?: boolean;
  asciiCharset?: string;
  asciiTone?: AsciiTone;
  asciiDensity?: number;
  asciiEdges?: boolean;
  asciiEdgeThreshold?: number;
  halftoneAngle?: number;
  halftoneStyle?: "mono" | "color" | "cmyk";
  halftoneShape?: HalftoneShape;
  popartThreshold?: number;
  contourLevels?: number;
  contourFill?: boolean;
  mangaAngle?: number;
}

type RecipeOverrides = Partial<MoshRecipe> & Pick<MoshRecipe, "modes">;

const RECIPE_DEFAULTS: Omit<MoshRecipe, "modes"> = {
  resolution: 2.0,
  contrast: 1.3,
  brightness: 1.0,
  saturation: 1.3,
  ditherMethod: "atkinson",
  ditherFactor: 1,
  isColor: true,
  grain: 0,
  hue: 0,
};

const recipe = (overrides: RecipeOverrides): MoshRecipe => ({ ...RECIPE_DEFAULTS, ...overrides });

const dither = (ditherMethod: DitherMethod, overrides: Partial<MoshRecipe> = {}): MoshRecipe =>
  recipe({ modes: ["dither"], ditherMethod, ...overrides });

const mono = { isColor: false, saturation: 0 };

export const MOSH_RECIPES: MoshRecipe[] = [
  dither("atkinson", { contrast: 1.15, brightness: 0.95, saturation: 0.75, ditherFactor: 0.95, hue: 9 }),
  dither("bayer-8", { contrast: 1.5, brightness: 1.05, saturation: 2.0, hue: 22 }),
  dither("floyd-steinberg", { ...mono, contrast: 2.1, brightness: 0.97, ditherFactor: 1.05 }),
  dither("bayer-4", { ...mono, contrast: 2.0, brightness: 0.92, ditherFactor: 1.1 }),
  dither("bayer-2", { contrast: 1.65, saturation: 1.8, ditherFactor: 0.9 }),
  dither("blue-noise", { contrast: 1.35, brightness: 1.05, saturation: 2.2, hue: 290 }),
  dither("atkinson", { contrast: 1.6, brightness: 1.05, saturation: 1.9, ditherFactor: 1.05 }),
  dither("atkinson", { ...mono, contrast: 1.55, brightness: 0.92, ditherFactor: 0.9 }),
  dither("sierra", { contrast: 1.6, saturation: 2.2, hue: 120 }),
  dither("stucki", { ...mono, contrast: 1.45 }),
  dither("jjn", { ...mono, contrast: 1.7, ditherFactor: 0.95 }),
  dither("burkes", { contrast: 1.4, saturation: 1.5 }),
  dither("sierra-lite", { ...mono, contrast: 1.8, brightness: 1.02 }),
  dither("blue-noise", { ...mono, contrast: 1.6 }),
  dither("threshold", { ...mono, contrast: 2.0 }),
  dither("atkinson", { usesPalette: true, contrast: 1.3, saturation: 1.2 }),
  dither("floyd-steinberg", { usesPalette: true, contrast: 1.25, saturation: 1.3 }),
  dither("bayer-4", { usesPalette: true, contrast: 1.4, saturation: 1.2 }),
  dither("blue-noise", { usesPalette: true, contrast: 1.3, saturation: 1.1 }),

  recipe({ modes: ["ascii"], contrast: 1.4, brightness: 1.05, asciiCharset: ASCII_DETAILED, asciiTone: "dark", asciiDensity: 1 }),
  recipe({ modes: ["ascii"], ...mono, contrast: 1.55, asciiCharset: ASCII_DETAILED, asciiTone: "dark", asciiDensity: 1.1, asciiEdges: true, asciiEdgeThreshold: 0.62 }),
  recipe({ modes: ["ascii"], contrast: 1.4, saturation: 1.6, hue: 130, asciiCharset: ASCII_CODE, asciiTone: "dark", asciiDensity: 1.25 }),
  recipe({ modes: ["ascii"], ...mono, contrast: 1.5, asciiCharset: ASCII_DETAILED, asciiTone: "light", asciiDensity: 1.2 }),
  recipe({ modes: ["ascii"], contrast: 1.2, brightness: 1.05, asciiCharset: ASCII_BLOCKS, asciiTone: "dark", asciiDensity: 1 }),

  recipe({ modes: ["braille"], brightness: 1.05, saturation: 1.2, asciiDensity: 1 }),
  recipe({ modes: ["braille"], ...mono, contrast: 1.5, asciiDensity: 1.5 }),
  recipe({ modes: ["braille"], brightness: 1.05, saturation: 1.4, asciiDensity: 2 }),

  recipe({ modes: ["halftone"], brightness: 1.05, saturation: 1.4, halftoneAngle: 15, halftoneStyle: "cmyk", halftoneShape: "round" }),
  recipe({ modes: ["halftone"], ...mono, contrast: 1.45, halftoneAngle: 45, halftoneStyle: "mono", halftoneShape: "round" }),
  recipe({ modes: ["halftone"], brightness: 1.05, saturation: 1.8, halftoneAngle: 0, halftoneStyle: "color", halftoneShape: "round" }),
  recipe({ modes: ["halftone"], ...mono, contrast: 1.5, halftoneAngle: 30, halftoneStyle: "mono", halftoneShape: "square" }),
  recipe({ modes: ["halftone"], contrast: 1.35, saturation: 1.5, halftoneAngle: 22, halftoneStyle: "cmyk", halftoneShape: "square" }),
  recipe({ modes: ["halftone"], contrast: 1.25, saturation: 1.6, halftoneAngle: 45, halftoneStyle: "color", halftoneShape: "square" }),

  recipe({ modes: ["popart"], contrast: 1.4, saturation: 1.6, popartThreshold: 0.5 }),
  recipe({ modes: ["popart"], contrast: 1.5, saturation: 1.4, popartThreshold: 0.62 }),

  recipe({ modes: ["manga"], ...mono, contrast: 1.4, mangaAngle: 45 }),
  recipe({ modes: ["manga"], ...mono, contrast: 1.3, mangaAngle: 30 }),

  recipe({ modes: ["contour"], ...mono, grain: 0.02, contourLevels: 11, contourFill: false }),
  recipe({ modes: ["contour"], contourLevels: 8, contourFill: true }),
];

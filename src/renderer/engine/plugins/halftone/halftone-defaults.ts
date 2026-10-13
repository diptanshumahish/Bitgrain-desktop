const HALFTONE_LINES_MAX_VALUE = 600;

export type HalftoneStyle = "mono" | "color" | "cmyk";
export type HalftoneShape = "round" | "square" | "ellipse" | "diamond" | "line";

export interface HalftoneDefaults {
  lines: number;
  angle: number;
  style: HalftoneStyle;
  shape: HalftoneShape;
  intensity: number;
  sharpness: number;
  grit: number;
  invert: boolean;
}

export const HALFTONE_DEFAULTS: HalftoneDefaults = {
  lines: 120,
  angle: 45,
  style: "color",
  shape: "round",
  intensity: 1,
  sharpness: 70,
  grit: 0,
  invert: true,
};

export const HALFTONE_LINES_MIN = 20;
export const HALFTONE_LINES_MAX = HALFTONE_LINES_MAX_VALUE;
export const HALFTONE_MIN_CELL_PX = 4;
export const HALFTONE_LEGACY_CELL = 2;

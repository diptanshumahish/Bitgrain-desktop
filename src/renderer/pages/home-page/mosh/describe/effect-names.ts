import type { DitherMethod, TransformMode } from "../../../../engine/types";

export const DITHER_NAMES: Record<DitherMethod, string> = {
  threshold: "Threshold",
  "floyd-steinberg": "Floyd-Steinberg",
  atkinson: "Atkinson",
  random: "Random",
  sierra: "Sierra",
  "sierra-2": "Sierra two row",
  "sierra-lite": "Sierra lite",
  stucki: "Stucki",
  burkes: "Burkes",
  jjn: "Jarvis Judice Ninke",
  "bayer-2": "Bayer 2x2",
  "bayer-4": "Bayer 4x4",
  "bayer-8": "Bayer 8x8",
  "blue-noise": "Blue noise",
};

export const MODE_NAMES: Partial<Record<TransformMode, string>> = {
  ascii: "ASCII art",
  braille: "Braille",
  halftone: "Halftone",
  popart: "Pop grunge",
  manga: "Manga screentone",
  contour: "Contour lines",
};

export const HALFTONE_STYLE_NAMES: Record<"mono" | "color" | "cmyk", string> = {
  mono: "Mono",
  color: "Color",
  cmyk: "CMYK",
};

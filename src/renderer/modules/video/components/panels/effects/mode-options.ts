import type { TransformMode, EffectParams } from "../../../types";
import { ASCII_DETAILED } from "../../../../../engine/plugins/ascii";

export interface ModeOption {
  id: TransformMode;
  label: string;
  group: "Transform" | "Filter";
  glyph: string;
}

export const FILTER_MODES: ModeOption[] = [
  { id: "halftone", label: "Halftone", group: "Filter", glyph: ":::" },
  { id: "dither", label: "Dither", group: "Filter", glyph: "▒▓" },
  { id: "ascii", label: "ASCII", group: "Filter", glyph: "@%#" },
  { id: "braille", label: "Braille", group: "Filter", glyph: "⠿⠶" },
  { id: "scanlines", label: "Scanlines (CRT)", group: "Filter", glyph: "===" },
  { id: "crosshatch", label: "Crosshatch Etching", group: "Filter", glyph: "###" },
  { id: "popart", label: "Pop Grunge", group: "Filter", glyph: "!*!" },
  { id: "contour", label: "Contour", group: "Filter", glyph: "≋≋" },
  { id: "photocopy", label: "Photocopy", group: "Filter", glyph: "▦▦" },
  { id: "misprint", label: "Misprint", group: "Filter", glyph: "r·b" },
  { id: "fold", label: "Fold", group: "Filter", glyph: "▷◁" },
  { id: "dust", label: "Dust & Scratches", group: "Filter", glyph: "·˙·" },
  { id: "haze-bloom", label: "Haze & Bloom", group: "Filter", glyph: "(o)" },
  { id: "grain", label: "Film Grain", group: "Filter", glyph: ".:." },
  { id: "invert", label: "Invert", group: "Filter", glyph: "+/-" },
  { id: "grayscale", label: "Grayscale", group: "Filter", glyph: "B/W" },
  { id: "pixelate", label: "Pixelate", group: "Filter", glyph: "[#]" },
  { id: "colorgrade", label: "Color Grade", group: "Filter", glyph: "<>>" },
  { id: "duotone", label: "Duotone", group: "Filter", glyph: "◓◒" },
  { id: "colorwash", label: "Color Wash", group: "Filter", glyph: "≈≈≈" },
  { id: "vignette", label: "Vignette", group: "Filter", glyph: "( )" },
  { id: "posterize", label: "Posterize", group: "Filter", glyph: "▤▤" },
  { id: "sharpen", label: "Sharpen", group: "Filter", glyph: "▲△" },
];

export const ALL_MODES: ModeOption[] = [
  { id: "transform", label: "Zoom & Transform", group: "Transform", glyph: "<+>" },
  ...FILTER_MODES,
];

export const MODE_DEFAULTS: Partial<Record<TransformMode, Partial<EffectParams>>> = {
  halftone: {
    halftoneCell: 2,
    halftoneAngle: 45,
    halftoneStyle: "mono",
    halftoneShape: "round",
    halftoneIntensity: 1,
    halftoneSharpness: 60,
  },
  dither: { ditherMethod: "floyd-steinberg", ditherFactor: 1, isColor: true },
  ascii: { asciiCharset: ASCII_DETAILED, asciiTone: "dark", asciiDensity: 1, isColor: true },
  braille: { asciiDensity: 1, isColor: true },
  contour: { contourLevels: 8, contourFill: false, isColor: true },
  photocopy: { photocopyContrast: 3, photocopyThreshold: 0.5 },
  misprint: { misprintAmount: 4, misprintAngle: 0 },
  fold: { foldCount: 2, foldIntensity: 0.4 },
  dust: { dustAmount: 0.3, dustScratches: 3, dustSeed: 7 },
  scanlines: { scanlineSpacing: 4, scanlineIntensity: 0.4, scanlineRgbShift: 2 },
  crosshatch: { crosshatchSpacing: 8, crosshatchThickness: 1 },
  grain: { noise: 0.12 },
  "haze-bloom": {
    hazeIntensity: 0.3,
    bloomIntensity: 0.4,
    bloomThreshold: 0.7,
    hazeWarmth: 0.5,
  },
  colorgrade: { gradeTemperature: 0, gradeTint: 0, gradeVibrance: 0 },
  duotone: {
    duotoneShadow: "#1e1b4b",
    duotoneHighlight: "#fde68a",
    duotoneAmount: 1,
  },
  colorwash: { washColor: "#3b82f6", washIntensity: 0.4, washMode: "screen" },
  vignette: { vignetteAmount: 0.5, vignetteRadius: 0.7, vignetteSoftness: 0.5 },
  posterize: { posterizeLevels: 6 },
  sharpen: { sharpenAmount: 1 },
  transform: { scale: 1.5 },
};

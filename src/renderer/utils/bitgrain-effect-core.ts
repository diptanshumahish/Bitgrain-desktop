import type { TransformContext } from "../engine/types";
import type { BitgrainEffect, BitgrainEffectKind } from "../data/studioTypes";
import { ASCII_DETAILED, ASCII_CODE, ASCII_STANDARD, ASCII_BLOCKS } from "../engine/plugins/ascii";
import {
  HALFTONE_DEFAULTS,
  HALFTONE_LINES_MAX,
  HALFTONE_LINES_MIN,
} from "../engine/plugins/halftone/halftone-defaults";
import { POPART_DEFAULT_CELL, POPART_MIN_CELL } from "../engine/plugins/popart/popart-defaults";

export type BitgrainParamSpec =
  | { key: string; label: string; type: "number"; min: number; max: number; step: number; default: number }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[]; default: string }
  | { key: string; label: string; type: "boolean"; default: boolean };

export const BITGRAIN_EFFECTS: Array<{
  kind: BitgrainEffectKind;
  label: string;
  params: BitgrainParamSpec[];
}> = [
  {
    kind: "dither",
    label: "Dither",
    params: [
      {
        key: "ditherMethod",
        label: "Method",
        type: "select",
        options: [
          { value: "floyd-steinberg", label: "Floyd-Steinberg" },
          { value: "atkinson", label: "Atkinson" },
          { value: "bayer-2", label: "Bayer 2x2" },
          { value: "bayer-4", label: "Bayer 4x4" },
          { value: "bayer-8", label: "Bayer 8x8" },
          { value: "blue-noise", label: "Blue noise" },
          { value: "threshold", label: "Threshold" },
          { value: "burkes", label: "Burkes" },
          { value: "stucki", label: "Stucki" },
          { value: "jjn", label: "JJN" },
          { value: "sierra", label: "Sierra" },
          { value: "sierra-2", label: "Sierra 2" },
          { value: "sierra-lite", label: "Sierra lite" },
          { value: "random", label: "Random" },
        ],
        default: "floyd-steinberg",
      },
      { key: "ditherFactor", label: "Intensity", type: "number", min: 0, max: 4, step: 0.05, default: 1 },
      { key: "isColor", label: "Color", type: "boolean", default: false },
    ],
  },
  {
    kind: "halftone",
    label: "Halftone",
    params: [
      {
        key: "halftoneLines",
        label: "Dots across",
        type: "number",
        min: HALFTONE_LINES_MIN,
        max: HALFTONE_LINES_MAX,
        step: 10,
        default: HALFTONE_DEFAULTS.lines,
      },
      { key: "halftoneAngle", label: "Angle", type: "number", min: 0, max: 360, step: 1, default: HALFTONE_DEFAULTS.angle },
      {
        key: "halftoneStyle",
        label: "Style",
        type: "select",
        options: [
          { value: "mono", label: "Mono" },
          { value: "color", label: "Color" },
          { value: "cmyk", label: "CMYK" },
        ],
        default: HALFTONE_DEFAULTS.style,
      },
      { key: "halftoneIntensity", label: "Intensity", type: "number", min: 0, max: 1, step: 0.05, default: HALFTONE_DEFAULTS.intensity },
      { key: "halftoneInvert", label: "Invert", type: "boolean", default: HALFTONE_DEFAULTS.invert },
    ],
  },
  {
    kind: "ascii",
    label: "ASCII",
    params: [
      {
        key: "asciiCharset",
        label: "Characters",
        type: "select",
        options: [
          { value: ASCII_DETAILED, label: "Detailed" },
          { value: ASCII_CODE, label: "Code" },
          { value: ASCII_STANDARD, label: "Standard" },
          { value: ASCII_BLOCKS, label: "Blocks" },
        ],
        default: ASCII_DETAILED,
      },
      { key: "isColor", label: "Color", type: "boolean", default: false },
    ],
  },
  {
    kind: "pixelate",
    label: "Pixelate",
    params: [],
  },
  {
    kind: "scanlines",
    label: "Scanlines",
    params: [
      { key: "scanlineSpacing", label: "Spacing", type: "number", min: 2, max: 200, step: 1, default: 4 },
      { key: "scanlineIntensity", label: "Intensity", type: "number", min: 0, max: 1, step: 0.05, default: 0.5 },
    ],
  },
  {
    kind: "crosshatch",
    label: "Crosshatch",
    params: [
      { key: "crosshatchSpacing", label: "Spacing", type: "number", min: 3, max: 200, step: 1, default: 6 },
      { key: "crosshatchThickness", label: "Thickness", type: "number", min: 1, max: 40, step: 1, default: 1 },
    ],
  },
  {
    kind: "popart",
    label: "Pop art",
    params: [
      { key: "popartCell", label: "Cell", type: "number", min: POPART_MIN_CELL, max: 200, step: 1, default: POPART_DEFAULT_CELL },
      { key: "popartAngle", label: "Angle", type: "number", min: 0, max: 360, step: 1, default: 45 },
      { key: "popartThreshold", label: "Threshold", type: "number", min: 0, max: 1, step: 0.02, default: 0.5 },
    ],
  },
  {
    kind: "posterize",
    label: "Posterize",
    params: [
      { key: "posterizeLevels", label: "Levels", type: "number", min: 2, max: 64, step: 1, default: 6 },
    ],
  },
  {
    kind: "grain",
    label: "Grain",
    params: [
      { key: "noise", label: "Amount", type: "number", min: 0, max: 1, step: 0.02, default: 0.2 },
    ],
  },
  {
    kind: "photocopy",
    label: "Photocopy",
    params: [
      { key: "photocopyContrast", label: "Contrast", type: "number", min: 1, max: 40, step: 0.5, default: 3 },
      { key: "photocopyThreshold", label: "Threshold", type: "number", min: 0, max: 1, step: 0.05, default: 0.5 },
    ],
  },
  {
    kind: "misprint",
    label: "Misprint",
    params: [
      { key: "misprintAmount", label: "Shift", type: "number", min: 0, max: 100, step: 1, default: 4 },
      { key: "misprintAngle", label: "Angle", type: "number", min: 0, max: 360, step: 5, default: 0 },
    ],
  },
  {
    kind: "fold",
    label: "Fold",
    params: [
      { key: "foldCount", label: "Folds", type: "number", min: 1, max: 24, step: 1, default: 2 },
      { key: "foldIntensity", label: "Intensity", type: "number", min: 0, max: 1, step: 0.05, default: 0.4 },
    ],
  },
  {
    kind: "dust",
    label: "Dust & scratches",
    params: [
      { key: "dustAmount", label: "Dust", type: "number", min: 0, max: 1, step: 0.02, default: 0.3 },
      { key: "dustScratches", label: "Scratches", type: "number", min: 0, max: 100, step: 1, default: 3 },
      { key: "dustSeed", label: "Seed", type: "number", min: 0, max: 9999, step: 1, default: 7 },
    ],
  },
];

export const BITGRAIN_GROUP_ORDER = [
  "Halftone & screens",
  "Ink & line",
  "Color & tone",
  "Print texture",
] as const;

export const BITGRAIN_GROUPS: Record<BitgrainEffectKind, string> = {
  dither: "Halftone & screens",
  halftone: "Halftone & screens",
  pixelate: "Halftone & screens",
  scanlines: "Halftone & screens",
  ascii: "Ink & line",
  crosshatch: "Ink & line",
  popart: "Ink & line",
  posterize: "Color & tone",
  misprint: "Color & tone",
  grain: "Print texture",
  photocopy: "Print texture",
  fold: "Print texture",
  dust: "Print texture",
};

export const findEffectSpec = (kind: BitgrainEffectKind) =>
  BITGRAIN_EFFECTS.find((e) => e.kind === kind);

export const defaultParamsFor = (
  kind: BitgrainEffectKind,
): Record<string, number | string | boolean> => {
  const spec = findEffectSpec(kind);
  if (!spec) return {};
  const out: Record<string, number | string | boolean> = {};
  for (const p of spec.params) out[p.key] = p.default;
  return out;
};

export const fitWithin = (
  w: number,
  h: number,
  max: number,
): { w: number; h: number } => {
  const longest = Math.max(w, h);
  if (longest <= max) return { w, h };
  const factor = max / longest;
  return { w: Math.max(1, Math.round(w * factor)), h: Math.max(1, Math.round(h * factor)) };
};

const numberOrUndef = (raw: unknown): number | undefined =>
  typeof raw === "number" && Number.isFinite(raw) ? raw : undefined;

const stringOrUndef = (raw: unknown): string | undefined =>
  typeof raw === "string" ? raw : undefined;

const boolOrFalse = (raw: unknown): boolean => raw === true;

export const buildTransformContext = (
  data: Float32Array,
  width: number,
  height: number,
  effect: BitgrainEffect,
): TransformContext => {
  const params = effect.params ?? {};
  return {
    data,
    width,
    height,
    contrast: 1,
    brightness: 1,
    saturation: 1,
    isColor: boolOrFalse(params.isColor),
    asciiCharset: stringOrUndef(params.asciiCharset),
    ditherMethod: stringOrUndef(params.ditherMethod) as TransformContext["ditherMethod"],
    ditherFactor: numberOrUndef(params.ditherFactor),
    halftoneCell: numberOrUndef(params.halftoneCell),
    halftoneLines: numberOrUndef(params.halftoneLines),
    halftoneAngle: numberOrUndef(params.halftoneAngle),
    halftoneStyle: stringOrUndef(params.halftoneStyle) as TransformContext["halftoneStyle"],
    halftoneIntensity: numberOrUndef(params.halftoneIntensity),
    halftoneInvert: boolOrFalse(params.halftoneInvert),
    halftoneScale: numberOrUndef(params.halftoneScale),
    scanlineSpacing: numberOrUndef(params.scanlineSpacing),
    scanlineIntensity: numberOrUndef(params.scanlineIntensity),
    scanlineRgbShift: numberOrUndef(params.scanlineRgbShift),
    scanlineCurvature: numberOrUndef(params.scanlineCurvature),
    crosshatchSpacing: numberOrUndef(params.crosshatchSpacing),
    crosshatchThickness: numberOrUndef(params.crosshatchThickness),
    chromaticIntensity: numberOrUndef(params.chromaticIntensity),
    chromaticFalloff: numberOrUndef(params.chromaticFalloff),
    popartCell: numberOrUndef(params.popartCell),
    popartAngle: numberOrUndef(params.popartAngle),
    popartThreshold: numberOrUndef(params.popartThreshold),
    voronoiCell: numberOrUndef(params.voronoiCell),
    voronoiJitter: numberOrUndef(params.voronoiJitter),
    voronoiEdge: numberOrUndef(params.voronoiEdge),
    posterizeLevels: numberOrUndef(params.posterizeLevels),
    noise: numberOrUndef(params.noise),
    photocopyContrast: numberOrUndef(params.photocopyContrast),
    photocopyThreshold: numberOrUndef(params.photocopyThreshold),
    misprintAmount: numberOrUndef(params.misprintAmount),
    misprintAngle: numberOrUndef(params.misprintAngle),
    foldCount: numberOrUndef(params.foldCount),
    foldIntensity: numberOrUndef(params.foldIntensity),
    dustAmount: numberOrUndef(params.dustAmount),
    dustScratches: numberOrUndef(params.dustScratches),
    dustSeed: numberOrUndef(params.dustSeed),
  };
};

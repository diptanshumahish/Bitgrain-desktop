import type { ParamSpec, SelectOption } from "../../../engine/style-types";
import { RAMP_OPTIONS } from "../../glyph/glyph-ramps";
import { cellSizeParam } from "../../shared-params";
import { DEFAULT_PALETTE, PALETTE_OPTIONS } from "./colour/studio-palettes";
import { DEFAULT_SHAPE_SET, MIX_OPTIONS, SHAPE_SET_OPTIONS } from "./shapes/shape-library";

export const STUDIO_KEYS = {
  palette: "palette",
  glyphs: "glyphs",
  shapeSet: "shapeSet",
  mix: "mix",
  ramp: "ramp",
  colourBy: "colourBy",
  seed: "seed",
  bandSpread: "bandSpread",
  extractCount: "extractCount",
  saturation: "saturation",
  vibrance: "vibrance",
  hue: "hue",
  tintColour: "tintColour",
  tintAmount: "tintAmount",
  blackPoint: "blackPoint",
  whitePoint: "whitePoint",
  gamma: "gamma",
  posterize: "posterize",
} as const;

export const FORENSIC_RAMP = "forensic";
export const GLYPH_KIND_SHAPES = "shapes";
export const COLOUR_BY_NEAREST = "nearest";

const GLYPH_KIND_OPTIONS: readonly SelectOption[] = [
  { value: "chars", label: "Characters" },
  { value: GLYPH_KIND_SHAPES, label: "Shapes" },
];

const COLOUR_BY_OPTIONS: readonly SelectOption[] = [
  { value: "band", label: "Brightness" },
  { value: COLOUR_BY_NEAREST, label: "Closest colour" },
];

const STUDIO_RAMP_OPTIONS: readonly SelectOption[] = [{ value: FORENSIC_RAMP, label: "Forensic" }, ...RAMP_OPTIONS];

const slider = (key: string, label: string, min: number, max: number, fallback: number, step = 1): ParamSpec => ({
  kind: "number", key, label, min, max, step, default: fallback, advanced: true,
});

export const ASCII_STUDIO_PARAMS: readonly ParamSpec[] = [
  cellSizeParam("Size"),
  { kind: "select", key: STUDIO_KEYS.palette, label: "Palette", options: PALETTE_OPTIONS, default: DEFAULT_PALETTE },
  { kind: "select", key: STUDIO_KEYS.glyphs, label: "Glyphs", options: GLYPH_KIND_OPTIONS, default: "chars" },
  { kind: "select", key: STUDIO_KEYS.shapeSet, label: "Shape set", options: SHAPE_SET_OPTIONS, default: DEFAULT_SHAPE_SET, advanced: true },
  { kind: "select", key: STUDIO_KEYS.mix, label: "Shape mix", options: MIX_OPTIONS, default: "ramp", advanced: true },
  { kind: "select", key: STUDIO_KEYS.ramp, label: "Characters", options: STUDIO_RAMP_OPTIONS, default: "standard", advanced: true },
  { kind: "select", key: STUDIO_KEYS.colourBy, label: "Colour by", options: COLOUR_BY_OPTIONS, default: "band", advanced: true },
  slider(STUDIO_KEYS.seed, "Variation", 0, 100, 42),
  slider(STUDIO_KEYS.bandSpread, "Colour scatter", 0, 100, 0),
  slider(STUDIO_KEYS.extractCount, "Extracted colours", 2, 8, 5),
  slider(STUDIO_KEYS.saturation, "Saturation", -100, 100, 0),
  slider(STUDIO_KEYS.vibrance, "Vibrance", 0, 100, 0),
  slider(STUDIO_KEYS.hue, "Hue shift", -180, 180, 0),
  { kind: "colour", key: STUDIO_KEYS.tintColour, label: "Tint", default: "#ff2da0", advanced: true },
  slider(STUDIO_KEYS.tintAmount, "Tint amount", 0, 100, 0),
  slider(STUDIO_KEYS.blackPoint, "Black point", 0, 100, 0),
  slider(STUDIO_KEYS.whitePoint, "White point", 0, 100, 100),
  slider(STUDIO_KEYS.gamma, "Gamma", 0.2, 3, 1, 0.05),
  slider(STUDIO_KEYS.posterize, "Tone steps", 0, 8, 0),
];

import type { ParamSpec } from "../engine/style-types";

export const FINISH_KEYS = {
  glow: "glow",
  contrast: "contrast",
  brightness: "brightness",
  threshold: "threshold",
  coverage: "coverage",
  invert: "invert",
  opacity: "opacity",
  blend: "blend",
  backdrop: "backdrop",
  backdropBlur: "backdropBlur",
  backdropOpacity: "backdropOpacity",
  backdropColour: "backdropColour",
} as const;

export type BackdropMode = "blur" | "original" | "solid" | "none";

const BACKDROP_OPTIONS = [
  { value: "blur", label: "Soft photo" },
  { value: "original", label: "Photo" },
  { value: "solid", label: "Solid" },
  { value: "none", label: "Clear" },
] as const;

const BLEND_OPTIONS = [
  { value: "source-over", label: "Normal" },
  { value: "screen", label: "Screen" },
  { value: "overlay", label: "Overlay" },
  { value: "color-dodge", label: "Dodge" },
  { value: "lighter", label: "Add" },
] as const;

export const FINISH_PARAMS: readonly ParamSpec[] = [
  { kind: "number", key: FINISH_KEYS.glow, label: "Glow", min: 0, max: 100, step: 1, default: 0, hint: "Soft light around each mark" },
  { kind: "number", key: FINISH_KEYS.contrast, label: "Contrast", min: -100, max: 150, step: 1, default: 100, advanced: true },
  { kind: "number", key: FINISH_KEYS.brightness, label: "Brightness", min: -100, max: 100, step: 1, default: 0, advanced: true },
  { kind: "number", key: FINISH_KEYS.threshold, label: "Shadow cut", min: 0, max: 100, step: 1, default: 30, advanced: true, hint: "How much of the dark area stays empty" },
  { kind: "number", key: FINISH_KEYS.coverage, label: "Coverage", min: 0, max: 100, step: 1, default: 100, suffix: "%", advanced: true },
  { kind: "toggle", key: FINISH_KEYS.invert, label: "Invert tones", default: false, advanced: true },
  { kind: "number", key: FINISH_KEYS.opacity, label: "Opacity", min: 0, max: 100, step: 1, default: 100, suffix: "%", advanced: true },
  { kind: "select", key: FINISH_KEYS.blend, label: "Blend", options: BLEND_OPTIONS, default: "source-over", advanced: true },
  { kind: "select", key: FINISH_KEYS.backdrop, label: "Behind", options: BACKDROP_OPTIONS, default: "blur", advanced: true },
  { kind: "number", key: FINISH_KEYS.backdropBlur, label: "Softness", min: 0, max: 60, step: 1, default: 8, advanced: true, scalesWithExport: true },
  { kind: "number", key: FINISH_KEYS.backdropOpacity, label: "Photo", min: 0, max: 100, step: 1, default: 100, suffix: "%", advanced: true },
  { kind: "colour", key: FINISH_KEYS.backdropColour, label: "Solid colour", default: "#000000", advanced: true },
];

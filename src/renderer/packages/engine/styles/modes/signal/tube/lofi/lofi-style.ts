import type { FrameRenderInput, FrameStyleDefinition } from "../../../../engine/style-definition";
import type { StyleLook } from "../../../../engine/style-types";
import { numberParam } from "../../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../../finish/frame-tone";
import { bloom, combine, grain, tint, vignette } from "../../../../looks/look-builders";
import { PERCENT } from "../../shared/signal-math";
import { seedFrom } from "../../shared/signal-hash";
import { drawDefocused } from "./defocus";
import { applyLofiGrade } from "./lofi-grade";

const FOCUS_SHARE = 0.05;
const SATURATION_GAIN = 2;
const WARMTH_CENTRE = 0.5;

const unit = (params: FrameRenderInput["params"], key: string): number => numberParam(params, key) / PERCENT;

const renderLofi = ({ frame, source, params, scale, random }: FrameRenderInput): void => {
  const toned = toneAdjustedSource(source, params);
  drawDefocused(frame, toned, unit(params, "focus") * FOCUS_SHARE * toned.height, unit(params, "glow"));
  const pixels = frame.pixels();
  applyLofiGrade(pixels.data, frame.width, frame.height, {
    saturation: unit(params, "saturation") * SATURATION_GAIN,
    warmth: (unit(params, "warmth") - WARMTH_CENTRE) * 2,
    noise: unit(params, "noise"),
    vignette: unit(params, "vignette"),
    scale,
    seed: seedFrom(random),
  });
};

export const LOFI_STYLE: FrameStyleDefinition = {
  id: "lofi",
  label: "Lofi",
  hint: "A soft, dusty, out of focus snapshot",
  glyph: "◌",
  category: "glitch",
  kind: "frame",
  params: [
    { kind: "number", key: "focus", label: "Softness", min: 0, max: 100, step: 1, default: 42, suffix: "%" },
    { kind: "number", key: "noise", label: "Dust", min: 0, max: 100, step: 1, default: 55, suffix: "%" },
    { kind: "number", key: "glow", label: "Glow", min: 0, max: 100, step: 1, default: 30, suffix: "%" },
    { kind: "number", key: "saturation", label: "Saturation", min: 0, max: 100, step: 1, default: 55, suffix: "%", advanced: true },
    { kind: "number", key: "warmth", label: "Warmth", min: 0, max: 100, step: 1, default: 50, suffix: "%", advanced: true },
    { kind: "number", key: "vignette", label: "Vignette", min: 0, max: 100, step: 1, default: 48, suffix: "%", advanced: true },
    ...frameToneParams(),
  ],
  renderFrame: renderLofi,
};

export const LOFI_LOOKS: readonly StyleLook[] = [
  { name: "Vintage", params: { contrast: 24, warmth: 62 }, effects: combine(tint("#d8b46a", 38, "soft-light"), grain(26)) },
  { name: "Dreamy", params: { focus: 60, glow: 70, noise: 30, saturation: 60 }, effects: bloom(30) },
  { name: "Disposable", params: { focus: 18, noise: 75, warmth: 70, vignette: 65, contrast: 20 }, effects: grain(30) },
  { name: "Cold morning", params: { focus: 35, warmth: 25, saturation: 40, noise: 45 }, effects: tint("#7fb6ff", 20, "soft-light") },
  { name: "Faded", params: { focus: 28, saturation: 30, noise: 50, contrast: -20, brightness: 8 }, effects: vignette(30) },
];

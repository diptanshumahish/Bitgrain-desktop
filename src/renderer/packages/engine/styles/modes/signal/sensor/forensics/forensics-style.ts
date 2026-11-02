import type { FrameRenderInput, FrameStyleDefinition } from "../../../../engine/style-definition";
import type { StyleLook } from "../../../../engine/style-types";
import { numberParam } from "../../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../../finish/frame-tone";
import { bloom, combine, grain, tint, vignette } from "../../../../looks/look-builders";
import { PERCENT } from "../../shared/signal-math";
import { seedFrom } from "../../shared/signal-hash";
import { xrayPlate } from "./xray-plate";
import { layoutWindows } from "./spectral-windows";
import { shadeForensics } from "./forensics-render";
import { drawDiagnosticInk } from "./diagnostic-ink";

const RGB = 3;

const unit = (params: FrameRenderInput["params"], key: string): number => numberParam(params, key) / PERCENT;

const renderForensics = ({ frame, source, params, scale, random }: FrameRenderInput): void => {
  const toned = toneAdjustedSource(source, params);
  const plate = xrayPlate(toned, { contrast: unit(params, "xray"), edges: unit(params, "edges"), scale });
  const windows = layoutWindows({
    count: Math.round(numberParam(params, "windows")),
    size: unit(params, "size"),
    softness: unit(params, "softness"),
    seed: Math.round(numberParam(params, "layout")),
    width: toned.width,
    height: toned.height,
    plate,
  });
  const ink = unit(params, "ink");
  shadeForensics({
    source: toned, plate, windows, split: unit(params, "split") * scale, ink, noise: unit(params, "noise"),
    scale, seed: seedFrom(random), colour: new Float32Array(RGB), mask: 0,
  }, frame.pixels().data);
  drawDiagnosticInk(frame.context, windows, ink, scale);
};

export const FORENSICS_STYLE: FrameStyleDefinition = {
  id: "forensics",
  label: "Forensics",
  hint: "An x-ray plate with colour windows and lab markings",
  glyph: "⌖",
  category: "glitch",
  kind: "frame",
  params: [
    { kind: "number", key: "windows", label: "Windows", min: 0, max: 6, step: 1, default: 2 },
    { kind: "number", key: "edges", label: "Edge lines", min: 0, max: 100, step: 1, default: 45, suffix: "%" },
    { kind: "number", key: "split", label: "Colour shift", min: 0, max: 100, step: 1, default: 35, suffix: "%" },
    { kind: "number", key: "size", label: "Window size", min: 0, max: 100, step: 1, default: 45, suffix: "%", advanced: true },
    { kind: "number", key: "softness", label: "Window softness", min: 0, max: 100, step: 1, default: 12, suffix: "%", advanced: true },
    { kind: "number", key: "layout", label: "Layout", min: 1, max: 100, step: 1, default: 1, advanced: true, hint: "Try another number to move the windows" },
    { kind: "number", key: "ink", label: "Lab markings", min: 0, max: 100, step: 1, default: 55, suffix: "%", advanced: true },
    { kind: "number", key: "xray", label: "X-ray contrast", min: 0, max: 100, step: 1, default: 60, suffix: "%", advanced: true },
    { kind: "number", key: "noise", label: "Noise", min: 0, max: 100, step: 1, default: 20, suffix: "%", advanced: true },
    ...frameToneParams(),
  ],
  renderFrame: renderForensics,
};

export const FORENSICS_LOOKS: readonly StyleLook[] = [
  { name: "Lab report", params: { windows: 2, edges: 45, split: 35 }, effects: vignette(38) },
  { name: "Single scan", params: { windows: 1, size: 70, edges: 30, split: 20, ink: 75 }, effects: grain(14) },
  { name: "Evidence board", params: { windows: 4, size: 55, edges: 55, split: 45, layout: 7 }, effects: vignette(30) },
  { name: "Soft plate", params: { windows: 3, softness: 45, xray: 35, edges: 25 }, effects: bloom(24) },
  { name: "Night lab", params: { windows: 2, edges: 70, xray: 85, noise: 40 }, effects: combine(tint("#7fd8ff", 22, "soft-light"), vignette(45)) },
];

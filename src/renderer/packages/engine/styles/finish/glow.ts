import type { Frame } from "../engine/frame";
import { drawSoftCopy, softCopy } from "./soft-copy";

const PERCENT = 100;
const MAX_STRENGTH = 1.4;
const WIDE_BASE = 0.6;
const WIDE_GAIN = 1.6;
const TIGHT_BASE = 0.25;
const TIGHT_GAIN = 0.7;
const MIN_WIDE_BLUR = 2;
const MIN_TIGHT_BLUR = 1;
const SHADOW_TO_SIGMA = 0.5;
const ALPHA_BASE = 0.45;
const ALPHA_BRIGHT = 0.55;
const TYPICAL_BRIGHTNESS = 0.7;
const MIN_STRENGTH = 0.05;

const glowAlpha = (strength: number): number =>
  Math.min(1, ALPHA_BASE * strength + ALPHA_BRIGHT * strength * TYPICAL_BRIGHTNESS);

const addGlowPass = (frame: Frame, layer: Frame, blur: number, alpha: number): void => {
  const copy = softCopy(layer.canvas, layer.width, layer.height, blur * SHADOW_TO_SIGMA);
  const context = frame.context;
  context.globalCompositeOperation = "screen";
  context.globalAlpha = alpha;
  drawSoftCopy(context, copy, frame.width, frame.height);
  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
};

export const applyGlow = (frame: Frame, layer: Frame, glow: number, cellSize: number): void => {
  const strength = Math.min(MAX_STRENGTH, glow / PERCENT);
  if (strength <= MIN_STRENGTH) return;
  const alpha = glowAlpha(strength);
  addGlowPass(frame, layer, Math.max(MIN_WIDE_BLUR, cellSize * (WIDE_BASE + WIDE_GAIN * strength)), alpha);
  addGlowPass(frame, layer, Math.max(MIN_TIGHT_BLUR, cellSize * (TIGHT_BASE + TIGHT_GAIN * strength)), alpha);
};

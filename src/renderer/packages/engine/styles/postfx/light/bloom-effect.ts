import { Frame } from "../../engine/frame";
import { numberParam, textParam } from "../../engine/resolve-params";
import { drawSoftCopy, softCopy, type SoftCopy } from "../../finish/soft-copy";
import { percentParam, type EffectDefinition, type EffectInput } from "../effect-definition";

const PERCENT = 100;
const RADIUS_BASE = 2;
const RADIUS_GAIN = 0.24;
const SPREAD_GAIN = 0.05;
const SPREAD_ALPHA = 0.85;
const GLOW_ALPHA = 0.7;
const CHANNEL_MAX = 255;
const CHANNELS = 4;
const LUMA_R = 0.299;
const LUMA_G = 0.587;
const LUMA_B = 0.114;
const WHITE = "#ffffff";

const brightPass = (frame: Frame, threshold: number): Frame => {
  const pixels = new Uint8ClampedArray(frame.readPixels());
  const cutoff = CHANNEL_MAX * threshold;
  for (let index = 0; index < pixels.length; index += CHANNELS) {
    if (LUMA_R * pixels[index] + LUMA_G * pixels[index + 1] + LUMA_B * pixels[index + 2] >= cutoff) continue;
    pixels[index] = 0;
    pixels[index + 1] = 0;
    pixels[index + 2] = 0;
  }
  const bright = new Frame(frame.width, frame.height);
  bright.writePixels(pixels);
  return bright;
};

const tinted = (copy: SoftCopy, tint: string, amount: number): SoftCopy => {
  if (amount <= 0 || tint.toLowerCase() === WHITE) return copy;
  const context = copy.canvas.getContext("2d");
  if (!context) return copy;
  context.globalCompositeOperation = "multiply";
  context.globalAlpha = amount;
  context.fillStyle = tint;
  context.fillRect(0, 0, copy.width, copy.height);
  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
  return copy;
};

const composite = (frame: Frame, copy: SoftCopy, operation: GlobalCompositeOperation, alpha: number): void => {
  if (alpha <= 0) return;
  const context = frame.context;
  context.globalCompositeOperation = operation;
  context.globalAlpha = Math.min(1, alpha);
  drawSoftCopy(context, copy, frame.width, frame.height);
  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
};

const applyBloom = ({ frame, values, scale }: EffectInput): void => {
  const intensity = numberParam(values, "amount") / PERCENT;
  if (intensity <= 0) return;
  const bright = brightPass(frame, numberParam(values, "threshold") / PERCENT);
  const radius = Math.max(1, (RADIUS_BASE + RADIUS_GAIN * numberParam(values, "softness")) * scale);
  const tint = textParam(values, "tint");
  const tintAmount = numberParam(values, "tintAmount") / PERCENT;
  const spread = numberParam(values, "spread");
  const first = tinted(softCopy(bright.canvas, bright.width, bright.height, radius), tint, tintAmount);
  composite(frame, first, "screen", intensity);
  const wide = spread > 0 ? tinted(softCopy(bright.canvas, bright.width, bright.height, radius * (1 + SPREAD_GAIN * spread)), tint, tintAmount) : first;
  if (spread > 0) composite(frame, wide, "screen", (spread / PERCENT) * intensity * SPREAD_ALPHA);
  composite(frame, wide, "lighter", (numberParam(values, "glow") / PERCENT) * intensity * GLOW_ALPHA);
};

export const BLOOM_EFFECT: EffectDefinition = {
  key: "bloom",
  label: "Bloom",
  hint: "Highlights bleed soft light",
  params: [
    percentParam("amount", "Amount", 40),
    percentParam("threshold", "Starts at", 60, true),
    percentParam("softness", "Softness", 50, true),
    percentParam("spread", "Spread", 30, true),
    percentParam("glow", "Hot glow", 0, true),
    { kind: "colour", key: "tint", label: "Tint", default: "#ffffff", advanced: true },
    percentParam("tintAmount", "Tint amount", 0, true),
  ],
  apply: applyBloom,
};

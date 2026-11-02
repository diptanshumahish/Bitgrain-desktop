import type { SourceImage } from "../../../../engine/style-definition";
import { BYTE_MAX, CHANNELS, clampInt } from "../../shared/signal-math";
import type { SpectralWindow } from "./spectral-windows";

const SPLIT_PX = 5;
const WINDOW_LIFT = 1.08;
const TINT_STRENGTH = 0.6;
const TINT_CURVES: Readonly<Record<number, readonly (readonly [number, number])[]>> = {
  1: [[1, 0.5], [0.62, 1.6], [0.4, 3.2]],
  2: [[0.45, 3], [0.8, 1.35], [1, 0.5]],
};

const channelAt = (source: SourceImage, x: number, y: number, channel: number): number =>
  source.data[(clampInt(Math.round(y), source.height) * source.width + clampInt(Math.round(x), source.width)) * CHANNELS + channel] / BYTE_MAX;

const tintInto = (tint: number, colour: Float32Array): void => {
  const curves = TINT_CURVES[tint];
  if (!curves) return;
  for (let channel = 0; channel < curves.length; channel++) {
    const tinted = curves[channel][0] * colour[channel] ** curves[channel][1];
    colour[channel] += (tinted - colour[channel]) * TINT_STRENGTH;
  }
};

export const windowColourInto = (
  source: SourceImage, window: SpectralWindow, x: number, y: number, split: number, colour: Float32Array,
): void => {
  const dx = x - window.centreX;
  const dy = y - window.centreY;
  const length = Math.hypot(dx, dy) || 1;
  const reach = split * SPLIT_PX;
  colour[0] = channelAt(source, x + (dx / length) * reach, y + (dy / length) * reach, 0);
  colour[1] = channelAt(source, x, y, 1);
  colour[2] = channelAt(source, x - (dx / length) * reach, y - (dy / length) * reach, 2);
  tintInto(window.tint, colour);
  for (let channel = 0; channel < colour.length; channel++) colour[channel] *= WINDOW_LIFT;
};

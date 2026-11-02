import type { Frame } from "../../../../engine/frame";
import { frameFromPixels } from "../../../../engine/frame";
import { gaussianBlurPixels } from "../../../../finish/box-blur";
import { BYTE_MAX, CHANNELS } from "../../shared/signal-math";
import type { BeaconGrid } from "./beacon-grid";

const LIGHT_GAMMA = 2.2;
const TAIL_DECAY = 0.5;
const SELF_GLOW = 0.6;
const TONE_PEAK = 235;
const TONE_KNEE = 210;
const NEAR_BLUR_BASE = 0.35;
const NEAR_BLUR_RANGE = 1.4;
const FAR_BLUR_BASE = 0.8;
const FAR_BLUR_RANGE = 11;
const NEAR_ALPHA = 0.8;
const FAR_ALPHA_BASE = 0.25;
const FAR_ALPHA_GAIN = 1.1;
const RGB = 3;

interface BeaconGlow {
  angle: number;
  tail: number;
  gain: number;
  radius: number;
  opacity: number;
}

const streakInto = (grid: BeaconGrid, glow: BeaconGlow, column: number, row: number, sum: Float32Array): void => {
  const stepX = Math.cos(glow.angle);
  const stepY = Math.sin(glow.angle);
  sum.fill(0);
  for (let step = 0; step < glow.tail; step++) {
    const sourceColumn = Math.round(column - stepX * step);
    const sourceRow = Math.round(row - stepY * step);
    if (sourceColumn < 0 || sourceRow < 0 || sourceColumn >= grid.columns || sourceRow >= grid.rows) break;
    const index = sourceRow * grid.columns + sourceColumn;
    const weight = grid.luma[index] ** LIGHT_GAMMA * Math.exp(-step / (TAIL_DECAY * glow.tail)) * (step === 0 ? 1 + SELF_GLOW : 1);
    for (let channel = 0; channel < RGB; channel++) sum[channel] += grid.colour[index * CHANNELS + channel] * weight;
  }
};

const glowPixels = (grid: BeaconGrid, glow: BeaconGlow): Uint8ClampedArray => {
  const pixels = new Uint8ClampedArray(grid.columns * grid.rows * CHANNELS);
  const sum = new Float32Array(RGB);
  for (let row = 0; row < grid.rows; row++) {
    for (let column = 0; column < grid.columns; column++) {
      streakInto(grid, glow, column, row, sum);
      const at = (row * grid.columns + column) * CHANNELS;
      for (let channel = 0; channel < RGB; channel++) pixels[at + channel] = (TONE_PEAK * sum[channel] * glow.gain) / (sum[channel] * glow.gain + TONE_KNEE);
      pixels[at + 3] = BYTE_MAX;
    }
  }
  return pixels;
};

const drawBlurred = (frame: Frame, grid: BeaconGrid, pixels: Uint8ClampedArray, sigma: number, alpha: number): void => {
  const copy = new Uint8ClampedArray(pixels);
  gaussianBlurPixels(copy, grid.columns, grid.rows, sigma);
  const context = frame.context;
  context.globalCompositeOperation = "lighter";
  context.globalAlpha = Math.min(1, alpha);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(frameFromPixels(copy, grid.columns, grid.rows).canvas, 0, 0, grid.columns * grid.cell, grid.rows * grid.cell);
  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
};

export const drawBeaconGlow = (frame: Frame, grid: BeaconGrid, glow: BeaconGlow): void => {
  if (glow.gain <= 0 || glow.opacity <= 0) return;
  const pixels = glowPixels(grid, glow);
  drawBlurred(frame, grid, pixels, NEAR_BLUR_BASE + NEAR_BLUR_RANGE * glow.radius, NEAR_ALPHA * glow.opacity);
  drawBlurred(frame, grid, pixels, FAR_BLUR_BASE + FAR_BLUR_RANGE * glow.radius, glow.opacity * Math.min(1, FAR_ALPHA_BASE + FAR_ALPHA_GAIN * glow.gain));
};

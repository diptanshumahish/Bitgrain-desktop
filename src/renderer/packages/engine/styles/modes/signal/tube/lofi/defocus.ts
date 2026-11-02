import { frameFromPixels, type Frame } from "../../../../engine/frame";
import type { SourceImage } from "../../../../engine/style-definition";
import { BYTE_MAX, CHANNELS, lumaOf } from "../../shared/signal-math";

const TAP_COUNT = 32;
const GOLDEN_ANGLE = 2.39996;
const TAP_FALLOFF = 2.2;
const BLOOM_LIFT = 0.9;
const TARGET_TAP_PX = 6;
const MAX_DOWNSCALE = 4;
const RGB = 3;

interface SpiralTap {
  dx: number;
  dy: number;
  weight: number;
}

interface DefocusJob {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  taps: readonly SpiralTap[];
  totalWeight: number;
  bloom: number;
  sum: Float32Array;
}

const spiralTaps = (radius: number): SpiralTap[] =>
  Array.from({ length: TAP_COUNT }, (_, index) => {
    const position = (index + 0.5) / TAP_COUNT;
    const reach = Math.sqrt(position) * radius;
    return { dx: Math.cos(index * GOLDEN_ANGLE) * reach, dy: Math.sin(index * GOLDEN_ANGLE) * reach, weight: Math.exp(-TAP_FALLOFF * position) };
  });

const gatherTaps = (job: DefocusJob, x: number, y: number): void => {
  const { data, width, height, sum } = job;
  sum.fill(0);
  for (const tap of job.taps) {
    const column = Math.min(width - 1, Math.max(0, Math.round(x + tap.dx)));
    const row = Math.min(height - 1, Math.max(0, Math.round(y + tap.dy)));
    const at = (row * width + column) * CHANNELS;
    const luma = lumaOf(data[at], data[at + 1], data[at + 2]) / BYTE_MAX;
    const glowWeight = luma * luma * tap.weight;
    for (let channel = 0; channel < RGB; channel++) {
      sum[channel] += data[at + channel] * tap.weight;
      sum[channel + RGB] += data[at + channel] * glowWeight;
    }
  }
};

const defocusPixels = (job: DefocusJob): Uint8ClampedArray => {
  const out = new Uint8ClampedArray(job.data.length);
  const glowGain = BLOOM_LIFT * job.bloom;
  for (let y = 0; y < job.height; y++) {
    for (let x = 0; x < job.width; x++) {
      gatherTaps(job, x, y);
      const at = (y * job.width + x) * CHANNELS;
      for (let channel = 0; channel < RGB; channel++) out[at + channel] = (job.sum[channel] + glowGain * job.sum[channel + RGB]) / job.totalWeight;
      out[at + 3] = BYTE_MAX;
    }
  }
  return out;
};

const shrink = (source: SourceImage, factor: number): ImageData => {
  const width = Math.max(1, Math.round(source.width / factor));
  const height = Math.max(1, Math.round(source.height / factor));
  const full = frameFromPixels(source.data, source.width, source.height).canvas;
  const small = new OffscreenCanvas(width, height);
  const context = small.getContext("2d");
  if (!context) throw new Error("2D canvas is not available");
  context.imageSmoothingQuality = "high";
  context.drawImage(full, 0, 0, width, height);
  return context.getImageData(0, 0, width, height);
};

export const drawDefocused = (frame: Frame, source: SourceImage, radiusPx: number, bloom: number): void => {
  const factor = Math.min(MAX_DOWNSCALE, Math.max(1, Math.round(radiusPx / TARGET_TAP_PX / 2)));
  const small = shrink(source, factor);
  const taps = spiralTaps(radiusPx / factor);
  const job: DefocusJob = { data: small.data, width: small.width, height: small.height, taps, totalWeight: taps.reduce((total, tap) => total + tap.weight, 0), bloom, sum: new Float32Array(RGB * 2) };
  const canvas = frameFromPixels(defocusPixels(job), small.width, small.height).canvas;
  const context = frame.context;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(canvas, 0, 0, frame.width, frame.height);
};

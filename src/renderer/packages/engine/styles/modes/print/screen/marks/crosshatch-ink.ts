import { CHANNELS, clampUnit, DEGREES_TO_RADIANS, fract, smoothRange } from "../shared/screen-math";
import type { RgbTriple } from "../../../../postfx/pixel-ops";

const LAYER_ANGLES = [45, -45, 0, 90] as const;
const LAYER_THRESHOLDS = [0.12, 0.38, 0.6, 0.84] as const;
const LAYER_OFFSETS = [0, 0.5, 0.25, 0.75] as const;
const LAYER_FADE = 0.16;
const MIN_HALF_WIDTH = 0.18;
const WIDTH_GROWTH = 0.85;
const EDGE_SOFTNESS = 0.5;

interface HatchLayer {
  cosine: number;
  sine: number;
  threshold: number;
  offset: number;
}

interface HatchInk {
  darkness: Float32Array;
  width: number;
  height: number;
  spacing: number;
  halfWidth: number;
  angle: number;
  ink: RgbTriple;
  paper: RgbTriple;
}

const buildLayers = (angle: number): HatchLayer[] =>
  LAYER_ANGLES.map((layerAngle, index) => ({
    cosine: Math.cos((layerAngle + angle) * DEGREES_TO_RADIANS),
    sine: Math.sin((layerAngle + angle) * DEGREES_TO_RADIANS),
    threshold: LAYER_THRESHOLDS[index],
    offset: LAYER_OFFSETS[index],
  }));

const layerCoverage = (hatch: HatchInk, layer: HatchLayer, x: number, y: number, darkness: number): number => {
  const strength = smoothRange(layer.threshold, layer.threshold + LAYER_FADE, darkness);
  if (strength <= 0) return 0;
  const along = (x * layer.cosine + y * layer.sine) / hatch.spacing + layer.offset;
  const distance = Math.abs(fract(along) - 0.5) * hatch.spacing;
  const halfWidth = hatch.halfWidth * (MIN_HALF_WIDTH + WIDTH_GROWTH * strength);
  return clampUnit(halfWidth - distance + EDGE_SOFTNESS);
};

const inkAt = (hatch: HatchInk, layers: readonly HatchLayer[], x: number, y: number): number => {
  const darkness = hatch.darkness[y * hatch.width + x];
  let paperLeft = 1;
  for (const layer of layers) paperLeft *= 1 - layerCoverage(hatch, layer, x, y, darkness);
  return 1 - paperLeft;
};

export const paintHatching = (hatch: HatchInk, data: Uint8ClampedArray): void => {
  const layers = buildLayers(hatch.angle);
  const { ink, paper } = hatch;
  for (let y = 0; y < hatch.height; y++) {
    for (let x = 0; x < hatch.width; x++) {
      const amount = inkAt(hatch, layers, x, y);
      const index = (y * hatch.width + x) * CHANNELS;
      data[index] = paper[0] + (ink[0] - paper[0]) * amount;
      data[index + 1] = paper[1] + (ink[1] - paper[1]) * amount;
      data[index + 2] = paper[2] + (ink[2] - paper[2]) * amount;
    }
  }
};

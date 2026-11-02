import { hashUnit } from "../../shared/signal-hash";
import { BYTE_MAX, CHANNELS, HALF_UNIT, lumaOf, mixValue, smoothRange } from "../../shared/signal-math";

const FINE_CELL_PX = 1.4;
const COARSE_CELL_PX = 3;
const THRESHOLD_CLEAN = 0.985;
const THRESHOLD_DIRTY = 0.93;
const COARSE_THRESHOLD_LIFT = 0.02;
const FINE_WEIGHT = 0.85;
const COARSE_WEIGHT = 0.45;
const BASE_GRAIN = 0.05;
const SPECK_CHROMA = 0.5;
const SHADOW_GATE = 0.12;
const HIGHLIGHT_EASE = 0.55;
const HIGHLIGHT_START = 0.4;
const GRAIN_SHARE = 0.6;
const WARM_RED = 0.09;
const WARM_GREEN = 0.02;
const VIGNETTE_START = 0.35;
const VIGNETTE_END = 1.1;
const COARSE_SEED_OFFSET = 1;
const BASE_SEED_OFFSET = 2;
const CHROMA_SEED_OFFSET = 3;
const RGB = 3;

interface LofiGrade {
  saturation: number;
  warmth: number;
  noise: number;
  vignette: number;
  scale: number;
  seed: number;
}

const speckles = (hash: number, threshold: number): number => smoothRange(threshold, 1, hash) - smoothRange(threshold, 1, 1 - hash);

const speckAt = (grade: LofiGrade, x: number, y: number): number => {
  const threshold = mixValue(THRESHOLD_CLEAN, THRESHOLD_DIRTY, grade.noise);
  const fineSize = FINE_CELL_PX * grade.scale;
  const coarseSize = COARSE_CELL_PX * grade.scale;
  const fine = speckles(hashUnit(Math.floor(x / fineSize), Math.floor(y / fineSize), grade.seed), threshold);
  const coarseHash = hashUnit(Math.floor(x / coarseSize), Math.floor(y / coarseSize), grade.seed + COARSE_SEED_OFFSET);
  return FINE_WEIGHT * fine + COARSE_WEIGHT * speckles(coarseHash, threshold + COARSE_THRESHOLD_LIFT);
};

const gradeColour = (data: Uint8ClampedArray, at: number, grade: LofiGrade, colour: Float32Array): number => {
  const luma = lumaOf(data[at], data[at + 1], data[at + 2]) / BYTE_MAX;
  for (let channel = 0; channel < RGB; channel++) colour[channel] = mixValue(luma, data[at + channel] / BYTE_MAX, grade.saturation);
  colour[0] += WARM_RED * grade.warmth;
  colour[1] += WARM_GREEN * grade.warmth;
  colour[2] -= WARM_RED * grade.warmth;
  return luma;
};

const speckChroma = (grade: LofiGrade, x: number, y: number, channel: number, speck: number): number =>
  speck === 0 ? 0 : (hashUnit(x, y, grade.seed + CHROMA_SEED_OFFSET + channel) - HALF_UNIT) * Math.abs(speck) * SPECK_CHROMA;

const gradeAt = (data: Uint8ClampedArray, at: number, grade: LofiGrade, x: number, y: number, shade: number, colour: Float32Array): void => {
  const luma = gradeColour(data, at, grade, colour);
  const weight = smoothRange(0, SHADOW_GATE, luma) * mixValue(1, HIGHLIGHT_EASE, smoothRange(HIGHLIGHT_START, 1, luma)) * grade.noise * GRAIN_SHARE;
  const speck = weight > 0 ? speckAt(grade, x, y) : 0;
  const base = (hashUnit(x, y, grade.seed + BASE_SEED_OFFSET) - HALF_UNIT) * BASE_GRAIN;
  for (let channel = 0; channel < RGB; channel++) {
    const dirt = (speck + base + speckChroma(grade, x, y, channel, speck)) * weight;
    data[at + channel] = (colour[channel] + dirt) * shade * BYTE_MAX;
  }
};

export const applyLofiGrade = (data: Uint8ClampedArray, width: number, height: number, grade: LofiGrade): void => {
  const colour = new Float32Array(RGB);
  const centreX = width / 2;
  const centreY = height / 2;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const radius = Math.hypot((x - centreX) / centreX, (y - centreY) / centreY);
      const shade = 1 - grade.vignette * smoothRange(VIGNETTE_START, VIGNETTE_END, radius);
      gradeAt(data, (y * width + x) * CHANNELS, grade, x, y, shade, colour);
    }
  }
};

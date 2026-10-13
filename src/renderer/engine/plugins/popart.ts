import type {
  ImagePlugin,
  TransformContext,
  TransformationResult,
} from "../types";
import { POPART_DEFAULT_CELL, POPART_MIN_CELL } from "./popart/popart-defaults";

const DEFAULT_INK: [number, number, number] = [220, 38, 38];
const DEFAULT_PAPER: [number, number, number] = [10, 10, 10];
const HASH_SEED_GRAIN = 1469598103;
const HASH_SEED_SPATTER = 2654435761;
const HASH_SEED_CELL = 374761393;

const CONTRAST_PUNCH = 2.4;
const CELL_JITTER = 0.12;
const FEATHER_MIN = 0.8;
const FEATHER_RATIO = 0.08;
const GRAIN_AMP = 46;
const GRIT_RATE = 0.05;
const DROPOUT_RATIO = 0.5;
const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;
const BYTE_MAX = 255;

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function hash2d(x: number, y: number, seed: number): number {
  let h = ((x | 0) * 374761393 + (y | 0) * 668265263 + seed) | 0;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

function luminance(r: number, g: number, b: number): number {
  return (r * LUMA_R + g * LUMA_G + b * LUMA_B) / BYTE_MAX;
}

export const PopArtPlugin: ImagePlugin = {
  id: "popart",
  name: "Pop Grunge",
  category: "Creative",

  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const cell = Math.max(POPART_MIN_CELL, ctx.popartCell ?? POPART_DEFAULT_CELL);
    const angleDeg = ctx.popartAngle ?? 30;
    const threshold = clamp01(ctx.popartThreshold ?? 0.55);
    const grain = clamp01(ctx.popartGrain ?? 0.35);
    const spatter = clamp01(ctx.popartSpatter ?? 0.45);
    const ink = ctx.popartInk ?? DEFAULT_INK;
    const paper = ctx.popartPaper ?? DEFAULT_PAPER;
    const inkOnDarkPaper = luminance(paper[0], paper[1], paper[2]) < luminance(ink[0], ink[1], ink[2]);
    const frameSeed = (ctx.popartFrameSeed ?? ctx.frameSeed ?? 0) | 0;
    const grainSeed = (HASH_SEED_GRAIN ^ Math.imul(frameSeed, 2246822519)) >>> 0;
    const spatterSeed = (HASH_SEED_SPATTER ^ Math.imul(frameSeed, 3266489917)) >>> 0;
    const cellSeed = (HASH_SEED_CELL ^ Math.imul(frameSeed, 668265263)) >>> 0;

    const out = new Uint8ClampedArray(width * height * 4);
    const angleRad = (angleDeg * Math.PI) / 180;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);
    const halfCell = cell * 0.5;
    const midX = width * 0.5;
    const midY = height * 0.5;
    const feather = Math.max(FEATHER_MIN, cell * FEATHER_RATIO);
    const gritChance = spatter * GRIT_RATE;
    const grainAmp = grain * GRAIN_AMP;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const idx = (py * width + px) * 4;
        const luma = luminance(data[idx], data[idx + 1], data[idx + 2]);
        const tone = clamp01((luma - threshold) * CONTRAST_PUNCH + 0.5);
        const density = inkOnDarkPaper ? tone : 1 - tone;

        const dx0 = px - midX;
        const dy0 = py - midY;
        const rx = dx0 * cosA + dy0 * sinA;
        const ry = -dx0 * sinA + dy0 * cosA;
        const cx = Math.round(rx / cell) * cell;
        const cy = Math.round(ry / cell) * cell;
        const dx = rx - cx;
        const dy = ry - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const cellJitter = (hash2d(cx, cy, cellSeed) - 0.5) * CELL_JITTER * cell;
        const dotRadius = halfCell * Math.sqrt(density) + cellJitter;
        let coverage = clamp01((dotRadius - dist) / feather + 0.5);

        const speck = hash2d(px, py, spatterSeed);
        if (coverage < 0.5 && speck > 1 - gritChance) coverage = 1;
        else if (coverage > 0.5 && speck < gritChance * DROPOUT_RATIO) coverage = 0;

        const texture = (hash2d(px, py, grainSeed) - 0.5) * grainAmp;
        out[idx] = paper[0] + (ink[0] - paper[0]) * coverage + texture;
        out[idx + 1] = paper[1] + (ink[1] - paper[1]) * coverage + texture;
        out[idx + 2] = paper[2] + (ink[2] - paper[2]) * coverage + texture;
        out[idx + 3] = 255;
      }
    }

    const workingData = new Float32Array(out.length);
    for (let i = 0; i < out.length; i++) workingData[i] = out[i];
    return { colorData: out, workingData };
  },
};

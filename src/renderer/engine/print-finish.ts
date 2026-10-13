import { createSeededRandom, DEFAULT_EFFECT_SEED, type RandomSource } from "./utils/seeded-random";

export interface PrintFinishOptions {
  strength: number;
  paper: [number, number, number];
  ink: [number, number, number];
}

export const NEWSPRINT_INK: [number, number, number] = [26, 22, 18];
export const DEFAULT_PAPER: [number, number, number] = [247, 241, 227];

const BYTE_MAX = 255;
const RGBA_STRIDE = 4;
const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;

const TONE_SCALE = 0.55;
const MUTE_AMOUNT = 0.08;
const MOTTLE_CELL_DIVISOR = 24;
const MOTTLE_MIN_CELL = 8;
const MOTTLE_AMOUNT = 0.04;
const GRAIN_SIGMA = 6;
const HIGHLIGHT_BOOST = 0.25;
const SHADOW_BOOST_RANGE = 0.9;
const MISREGISTRATION_DIVISOR = 1100;
const MISREGISTRATION_MAX = 1;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const clamp = (value: number, lo: number, hi: number): number =>
  value < lo ? lo : value > hi ? hi : value;

const paperFromHex = (hex?: string): [number, number, number] => {
  if (!hex || hex[0] !== "#" || hex.length < 7) return DEFAULT_PAPER;
  const value = parseInt(hex.slice(1, 7), 16);
  if (Number.isNaN(value)) return DEFAULT_PAPER;
  return [(value >> 16) & BYTE_MAX, (value >> 8) & BYTE_MAX, value & BYTE_MAX];
};

const toGrey = (rgb: [number, number, number]): [number, number, number] => {
  const luma = Math.round(rgb[0] * LUMA_R + rgb[1] * LUMA_G + rgb[2] * LUMA_B);
  return [luma, luma, luma];
};

export const buildPrintFinishOptions = (
  strength: number,
  bgColor?: string,
  neutral = false,
): PrintFinishOptions => {
  const paper = paperFromHex(bgColor);
  return {
    strength: clamp(strength, 0, 1),
    paper: neutral ? toGrey(paper) : paper,
    ink: neutral ? toGrey(NEWSPRINT_INK) : NEWSPRINT_INK,
  };
};

const buildMottleField = (
  width: number,
  height: number,
  random: RandomSource,
): { grid: Float32Array; gridWidth: number; gridHeight: number; cell: number } => {
  const longEdge = Math.max(width, height);
  const cell = Math.max(MOTTLE_MIN_CELL, Math.round(longEdge / MOTTLE_CELL_DIVISOR));
  const gridWidth = Math.max(2, Math.ceil(width / cell) + 1);
  const gridHeight = Math.max(2, Math.ceil(height / cell) + 1);
  const grid = new Float32Array(gridWidth * gridHeight);
  for (let i = 0; i < grid.length; i++) grid[i] = random() * 2 - 1;
  return { grid, gridWidth, gridHeight, cell };
};

const sampleMottle = (
  field: { grid: Float32Array; gridWidth: number; gridHeight: number; cell: number },
  x: number,
  y: number,
): number => {
  const fx = x / field.cell;
  const fy = y / field.cell;
  const x0 = Math.min(Math.floor(fx), field.gridWidth - 2);
  const y0 = Math.min(Math.floor(fy), field.gridHeight - 2);
  const tx = fx - x0;
  const ty = fy - y0;
  const row0 = y0 * field.gridWidth + x0;
  const row1 = row0 + field.gridWidth;
  const top = lerp(field.grid[row0], field.grid[row0 + 1], tx);
  const bottom = lerp(field.grid[row1], field.grid[row1 + 1], tx);
  return lerp(top, bottom, ty);
};

const applyTonalPass = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  opts: PrintFinishOptions,
  random: RandomSource,
): void => {
  const { strength, paper, ink } = opts;
  const muteMix = MUTE_AMOUNT * strength;
  const toneMix = strength * TONE_SCALE;
  const paperMax = Math.max(paper[0], paper[1], paper[2]) || BYTE_MAX;
  const paperScale = BYTE_MAX / paperMax;
  const paperTint = [paper[0] * paperScale, paper[1] * paperScale, paper[2] * paperScale];
  const field = buildMottleField(width, height, random);
  let i = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++, i += RGBA_STRIDE) {
      if (data[i + 3] === 0) continue;
      const mottle = 1 + sampleMottle(field, x, y) * MOTTLE_AMOUNT * strength;
      const lumaT = clamp((data[i] * LUMA_R + data[i + 1] * LUMA_G + data[i + 2] * LUMA_B) / BYTE_MAX, 0, 1);
      const shadowFloor = 1 - lumaT;
      const shadowCurve = shadowFloor * shadowFloor * shadowFloor;
      const highlightCurve = lumaT * lumaT * lumaT;
      for (let ch = 0; ch < 3; ch++) {
        const shadowLift = ink[ch] * shadowCurve * toneMix;
        const highlightWarmth = (paperTint[ch] - BYTE_MAX) * highlightCurve * toneMix;
        data[i + ch] = data[i + ch] + shadowLift + highlightWarmth;
      }
      const luma = data[i] * LUMA_R + data[i + 1] * LUMA_G + data[i + 2] * LUMA_B;
      for (let ch = 0; ch < 3; ch++) {
        data[i + ch] = lerp(data[i + ch], luma, muteMix) * mottle;
      }
    }
  }
};

const applyMisregistration = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  strength: number,
): void => {
  const shift = clamp(
    Math.round((strength * Math.max(width, height)) / MISREGISTRATION_DIVISOR),
    0,
    MISREGISTRATION_MAX,
  );
  if (shift === 0) return;
  const source = data.slice();
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const i = (row + x) * RGBA_STRIDE;
      if (data[i + 3] === 0) continue;
      const xr = clamp(x + shift, 0, width - 1);
      const xb = clamp(x - shift, 0, width - 1);
      data[i] = source[(row + xr) * RGBA_STRIDE];
      data[i + 2] = source[(row + xb) * RGBA_STRIDE + 2];
    }
  }
};

const applyGrain = (data: Uint8ClampedArray, strength: number, random: RandomSource): void => {
  const sigma = GRAIN_SIGMA * strength;
  for (let i = 0; i < data.length; i += RGBA_STRIDE) {
    if (data[i + 3] === 0) continue;
    const luma = (data[i] * LUMA_R + data[i + 1] * LUMA_G + data[i + 2] * LUMA_B) / BYTE_MAX;
    const shadowBoost = HIGHLIGHT_BOOST + SHADOW_BOOST_RANGE * (1 - luma);
    const grain = (random() - 0.5) * sigma * 2 * shadowBoost;
    data[i] += grain;
    data[i + 1] += grain;
    data[i + 2] += grain;
  }
};

export const applyPrintFinish = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  opts: PrintFinishOptions,
): void => {
  if (opts.strength <= 0) return;
  const random = createSeededRandom(DEFAULT_EFFECT_SEED);
  applyTonalPass(data, width, height, opts, random);
  applyMisregistration(data, width, height, opts.strength);
  applyGrain(data, opts.strength, random);
};

export const applyPrintFinishToCanvas = (
  canvas: HTMLCanvasElement,
  opts: PrintFinishOptions,
): void => {
  if (opts.strength <= 0 || canvas.width === 0 || canvas.height === 0) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  applyPrintFinish(imageData.data, canvas.width, canvas.height, opts);
  ctx.putImageData(imageData, 0, 0);
};

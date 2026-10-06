import type { ImagePlugin, TransformContext, TransformationResult } from '../types';
import { createSeededRandom, DEFAULT_EFFECT_SEED } from '../utils/seeded-random';

const RGBA_STRIDE = 4;
const BYTE_MAX = 255;
const DOT_PITCH = 6;
const DOT_RADIUS_RATIO = 0.42;
const DOT_GAP_LEVEL = 14;
const BLOCK_SIZE = 8;
const BLOCK_LEVELS = 5;
const GRUNGE_CHARS = 'X%&8BW#MWQL&';
const GRUNGE_DEFAULT_NOISE = 0.2;
const GRUNGE_NOISE_RANGE = 200;

type Rgb = [number, number, number];

const clampByte = (value: number): number => Math.max(0, Math.min(BYTE_MAX, value));

const lumaOf = (red: number, green: number, blue: number): number => (red + green + blue) / 3;

const averageBlock = (ctx: TransformContext, left: number, top: number, size: number): Rgb => {
  const { data, width, height } = ctx;
  const right = Math.min(width, left + size);
  const bottom = Math.min(height, top + size);
  const total: Rgb = [0, 0, 0];
  let count = 0;
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const index = (y * width + x) * RGBA_STRIDE;
      total[0] += data[index];
      total[1] += data[index + 1];
      total[2] += data[index + 2];
      count++;
    }
  }
  const divisor = Math.max(1, count);
  return [total[0] / divisor, total[1] / divisor, total[2] / divisor];
};

const toneFor = (color: Rgb, isColor: boolean): Rgb => {
  if (isColor) return color;
  const luma = lumaOf(color[0], color[1], color[2]);
  return [luma, luma, luma];
};

const writePixel = (result: TransformationResult, index: number, color: Rgb): void => {
  const { colorData, workingData } = result;
  if (!colorData || !workingData) return;
  for (let channel = 0; channel < 3; channel++) {
    workingData[index + channel] = color[channel];
    colorData[index + channel] = clampByte(color[channel]);
  }
  workingData[index + 3] = BYTE_MAX;
  colorData[index + 3] = BYTE_MAX;
};

const createResult = (ctx: TransformContext): TransformationResult => ({
  colorData: new Uint8ClampedArray(ctx.width * ctx.height * RGBA_STRIDE),
  workingData: new Float32Array(ctx.data.length),
});

const paintDotCell = (ctx: TransformContext, result: TransformationResult, left: number, top: number): void => {
  const tone = toneFor(averageBlock(ctx, left, top, DOT_PITCH), ctx.isColor);
  const gap: Rgb = [DOT_GAP_LEVEL, DOT_GAP_LEVEL, DOT_GAP_LEVEL];
  const center = DOT_PITCH / 2;
  const radius = DOT_PITCH * DOT_RADIUS_RATIO;
  const right = Math.min(ctx.width, left + DOT_PITCH);
  const bottom = Math.min(ctx.height, top + DOT_PITCH);
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const inside = Math.hypot(x - left + 0.5 - center, y - top + 0.5 - center) <= radius;
      writePixel(result, (y * ctx.width + x) * RGBA_STRIDE, inside ? tone : gap);
    }
  }
};

export const DotMatrixPlugin: ImagePlugin = {
  id: 'dot-matrix',
  name: 'Dot Matrix',
  category: 'Textures',
  transform: (ctx: TransformContext): TransformationResult => {
    const result = createResult(ctx);
    for (let top = 0; top < ctx.height; top += DOT_PITCH) {
      for (let left = 0; left < ctx.width; left += DOT_PITCH) paintDotCell(ctx, result, left, top);
    }
    return result;
  }
};

const quantizeLevel = (value: number): number => {
  const step = BYTE_MAX / (BLOCK_LEVELS - 1);
  return Math.round(clampByte(value) / step) * step;
};

const paintBlock = (ctx: TransformContext, result: TransformationResult, left: number, top: number): void => {
  const tone = toneFor(averageBlock(ctx, left, top, BLOCK_SIZE), ctx.isColor);
  const quantized: Rgb = [quantizeLevel(tone[0]), quantizeLevel(tone[1]), quantizeLevel(tone[2])];
  const right = Math.min(ctx.width, left + BLOCK_SIZE);
  const bottom = Math.min(ctx.height, top + BLOCK_SIZE);
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) writePixel(result, (y * ctx.width + x) * RGBA_STRIDE, quantized);
  }
};

export const BlockyPlugin: ImagePlugin = {
  id: 'blocky',
  name: 'Blocky',
  category: 'Textures',
  transform: (ctx: TransformContext): TransformationResult => {
    const result = createResult(ctx);
    for (let top = 0; top < ctx.height; top += BLOCK_SIZE) {
      for (let left = 0; left < ctx.width; left += BLOCK_SIZE) paintBlock(ctx, result, left, top);
    }
    return result;
  }
};

export const GrungePlugin: ImagePlugin = {
  id: 'grunge',
  name: 'Grunge ASCII',
  category: 'Textures',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height, contrast, isColor, brightness: brightnessParam, noise } = ctx;
    const random = createSeededRandom(ctx.frameSeed ?? DEFAULT_EFFECT_SEED);
    const noiseAmount = noise || GRUNGE_DEFAULT_NOISE;
    const result = createResult(ctx);
    const charData: string[] = [];
    let text = '';
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * RGBA_STRIDE;
        const base = lumaOf(data[index], data[index + 1], data[index + 2]);
        const adjusted = ((base / BYTE_MAX - 0.5) * contrast + 0.5 + (brightnessParam - 1)) * BYTE_MAX;
        const level = clampByte(adjusted + (random() - 0.5) * noiseAmount * GRUNGE_NOISE_RANGE);
        const char = GRUNGE_CHARS[Math.floor((level / BYTE_MAX) * (GRUNGE_CHARS.length - 1))];
        text += char;
        charData.push(char);
        const color: Rgb = isColor ? [data[index], data[index + 1], data[index + 2]] : [level, level, level];
        writePixel(result, index, color);
      }
      text += '\n';
    }
    return { ...result, text, charData };
  }
};

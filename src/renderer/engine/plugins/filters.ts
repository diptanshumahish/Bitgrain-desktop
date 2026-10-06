import type { ImagePlugin, TransformContext, TransformationResult } from '../types';

const BYTE_MAX = 255;
const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;
const SRGB_THRESHOLD = 0.04045;
const SRGB_LINEAR_DIVISOR = 12.92;
const SRGB_OFFSET = 0.055;
const SRGB_SCALE = 1.055;
const SRGB_GAMMA = 2.4;
const SRGB_INV_GAMMA = 1 / 2.4;
const SRGB_LINEAR_THRESHOLD = 0.0031308;
const PIXELATE_BLOCKS_ACROSS = 90;
const MIN_PIXELATE_BLOCK = 2;

const SRGB_TO_LINEAR = (() => {
  const table = new Float32Array(256);
  for (let index = 0; index < 256; index++) {
    const channel = index / BYTE_MAX;
    table[index] = channel <= SRGB_THRESHOLD
      ? channel / SRGB_LINEAR_DIVISOR
      : Math.pow((channel + SRGB_OFFSET) / SRGB_SCALE, SRGB_GAMMA);
  }
  return table;
})();

const toByteIndex = (value: number): number =>
  value < 0 ? 0 : value > BYTE_MAX ? BYTE_MAX : value | 0;

const linearToSrgb = (value: number): number => {
  const clamped = value < 0 ? 0 : value > 1 ? 1 : value;
  const channel = clamped <= SRGB_LINEAR_THRESHOLD
    ? clamped * SRGB_LINEAR_DIVISOR
    : SRGB_SCALE * Math.pow(clamped, SRGB_INV_GAMMA) - SRGB_OFFSET;
  return channel * BYTE_MAX;
};

export const InvertPlugin: ImagePlugin = {
  id: 'invert',
  name: 'Invert',
  category: 'Filters',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const colorData = new Uint8ClampedArray(width * height * 4);
    const workingData = new Float32Array(data.length);

    for (let i = 0; i < data.length; i += 4) {
      const r = BYTE_MAX - data[i];
      const g = BYTE_MAX - data[i + 1];
      const b = BYTE_MAX - data[i + 2];
      workingData[i] = r;
      workingData[i + 1] = g;
      workingData[i + 2] = b;
      workingData[i + 3] = 255;
      colorData[i] = r;
      colorData[i + 1] = g;
      colorData[i + 2] = b;
      colorData[i + 3] = 255;
    }

    return { colorData, workingData };
  }
};

export const GrayscalePlugin: ImagePlugin = {
  id: 'grayscale',
  name: 'Grayscale',
  category: 'Filters',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const colorData = new Uint8ClampedArray(width * height * 4);
    const workingData = new Float32Array(data.length);

    for (let i = 0; i < data.length; i += 4) {
      const linear =
        SRGB_TO_LINEAR[toByteIndex(data[i])] * LUMA_R +
        SRGB_TO_LINEAR[toByteIndex(data[i + 1])] * LUMA_G +
        SRGB_TO_LINEAR[toByteIndex(data[i + 2])] * LUMA_B;
      const value = linearToSrgb(linear);

      workingData[i] = workingData[i + 1] = workingData[i + 2] = value;
      workingData[i + 3] = 255;
      colorData[i] = colorData[i + 1] = colorData[i + 2] = value;
      colorData[i + 3] = 255;
    }

    return { colorData, workingData };
  }
};

export const PixelatePlugin: ImagePlugin = {
  id: 'pixelate',
  name: 'Pixelate',
  category: 'Filters',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const colorData = new Uint8ClampedArray(width * height * 4);
    const workingData = new Float32Array(data.length);
    const block = Math.max(MIN_PIXELATE_BLOCK, Math.round(Math.max(width, height) / PIXELATE_BLOCKS_ACROSS));

    for (let blockY = 0; blockY < height; blockY += block) {
      for (let blockX = 0; blockX < width; blockX += block) {
        const yEnd = Math.min(blockY + block, height);
        const xEnd = Math.min(blockX + block, width);
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let count = 0;
        for (let y = blockY; y < yEnd; y++) {
          for (let x = blockX; x < xEnd; x++) {
            const i = (y * width + x) * 4;
            sumR += data[i];
            sumG += data[i + 1];
            sumB += data[i + 2];
            count++;
          }
        }
        const r = sumR / count;
        const g = sumG / count;
        const b = sumB / count;
        for (let y = blockY; y < yEnd; y++) {
          for (let x = blockX; x < xEnd; x++) {
            const i = (y * width + x) * 4;
            workingData[i] = r;
            workingData[i + 1] = g;
            workingData[i + 2] = b;
            workingData[i + 3] = 255;
            colorData[i] = r;
            colorData[i + 1] = g;
            colorData[i + 2] = b;
            colorData[i + 3] = 255;
          }
        }
      }
    }

    return { colorData, workingData };
  }
};

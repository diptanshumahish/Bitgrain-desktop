import type { ImagePlugin, TransformContext, TransformationResult } from '../types';
import { tintGreyOnPaper } from '../tone/paper';

const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;

const sampleChannel = (
  data: Float32Array,
  width: number,
  height: number,
  x: number,
  y: number,
  channel: number,
): number => {
  const cx = x < 0 ? 0 : x >= width ? width - 1 : x;
  const cy = y < 0 ? 0 : y >= height ? height - 1 : y;
  return data[(cy * width + cx) * 4 + channel];
};

export const PhotocopyPlugin: ImagePlugin = {
  id: 'photocopy',
  name: 'Photocopy',
  category: 'Textures',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const contrast = Math.max(1, Math.min(40, ctx.photocopyContrast ?? 3));
    const threshold = Math.max(0, Math.min(1, ctx.photocopyThreshold ?? 0.5));
    const size = width * height * 4;
    const colorData = new Uint8ClampedArray(size);
    const workingData = new Float32Array(size);

    for (let i = 0; i < size; i += 4) {
      const luma = (data[i] * LUMA_R + data[i + 1] * LUMA_G + data[i + 2] * LUMA_B) / 255;
      const pushed = (luma - threshold) * contrast + 0.5;
      const value = Math.max(0, Math.min(1, pushed)) * 255;
      colorData[i] = colorData[i + 1] = colorData[i + 2] = value;
      colorData[i + 3] = 255;
      workingData[i] = workingData[i + 1] = workingData[i + 2] = value;
      workingData[i + 3] = 255;
    }

    if (ctx.paperColor) {
      tintGreyOnPaper(colorData, ctx.paperColor);
      workingData.set(colorData);
    }
    return { colorData, workingData };
  },
};

export const MisprintPlugin: ImagePlugin = {
  id: 'misprint',
  name: 'Misprint',
  category: 'Textures',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const amount = Math.max(0, Math.min(100, ctx.misprintAmount ?? 4));
    const angle = ((ctx.misprintAngle ?? 0) * Math.PI) / 180;
    const dx = Math.round(Math.cos(angle) * amount);
    const dy = Math.round(Math.sin(angle) * amount);
    const size = width * height * 4;
    const colorData = new Uint8ClampedArray(size);
    const workingData = new Float32Array(size);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 4;
        const r = sampleChannel(data, width, height, x + dx, y + dy, 0);
        const g = sampleChannel(data, width, height, x, y, 1);
        const b = sampleChannel(data, width, height, x - dx, y - dy, 2);
        colorData[i] = r;
        colorData[i + 1] = g;
        colorData[i + 2] = b;
        colorData[i + 3] = 255;
        workingData[i] = r;
        workingData[i + 1] = g;
        workingData[i + 2] = b;
        workingData[i + 3] = 255;
      }
    }

    return { colorData, workingData };
  },
};

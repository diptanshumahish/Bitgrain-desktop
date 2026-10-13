import type { ImagePlugin, TransformContext, TransformationResult } from '../types';
import { inkForPaper } from '../tone/paper';
import { gaussianBlur, toLuminance } from './ink-common';
import { measureLevels, stretchInPlace } from '../tone/auto-levels';

const PAPER: [number, number, number] = [242, 239, 230];
const INK: [number, number, number] = [22, 22, 18];
const MIN_LEVELS = 2;
const MAX_LEVELS = 24;
const DEFAULT_LEVELS = 8;
const SMOOTHING_PER_PIXEL = 1 / 260;
const MIN_SMOOTHING = 1.2;
const LEVELS_CLIP = 0.01;

const smoothTone = (ctx: TransformContext): Float32Array => {
  const luma = toLuminance(ctx.data, ctx.width, ctx.height);
  stretchInPlace(luma, measureLevels(luma, LEVELS_CLIP), 1);
  const sigma = Math.max(MIN_SMOOTHING, Math.min(ctx.width, ctx.height) * SMOOTHING_PER_PIXEL);
  return gaussianBlur(luma, ctx.width, ctx.height, sigma);
};

const bandOf = (value: number, levels: number): number => Math.min(levels - 1, Math.max(0, Math.floor(value * levels)));

const isBoundary = (band: Uint8Array, width: number, height: number, x: number, y: number): boolean => {
  const pixel = y * width + x;
  return (x + 1 < width && band[pixel] !== band[pixel + 1])
    || (y + 1 < height && band[pixel] !== band[pixel + width])
    || (x > 0 && band[pixel] > band[pixel - 1])
    || (y > 0 && band[pixel] > band[pixel - width]);
};

const quantizeChannel = (value: number, levels: number): number =>
  (Math.round((value / 255) * (levels - 1)) / (levels - 1)) * 255;

export const ContourPlugin: ImagePlugin = {
  id: 'contour',
  name: 'Contour',
  category: 'Filters',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height, isColor } = ctx;
    const levels = Math.max(MIN_LEVELS, Math.min(MAX_LEVELS, Math.round(ctx.contourLevels ?? DEFAULT_LEVELS)));
    const fill = ctx.contourFill === true;
    const paper = ctx.paperColor ?? PAPER;
    const ink = ctx.paperColor ? inkForPaper(ctx.paperColor) : INK;
    const tone = smoothTone(ctx);
    const band = new Uint8Array(width * height);
    for (let pixel = 0; pixel < band.length; pixel++) band[pixel] = bandOf(tone[pixel], levels);
    const out = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = y * width + x;
        const index = pixel * 4;
        for (let channel = 0; channel < 3; channel++) {
          if (isBoundary(band, width, height, x, y)) out[index + channel] = ink[channel];
          else if (!fill) out[index + channel] = paper[channel];
          else if (isColor) out[index + channel] = quantizeChannel(data[index + channel], levels);
          else out[index + channel] = paper[channel] + (ink[channel] - paper[channel]) * (1 - band[pixel] / (levels - 1));
        }
        out[index + 3] = 255;
      }
    }

    return { colorData: out };
  },
};

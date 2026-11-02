import type { ImagePlugin, TransformContext, TransformationResult } from '../core/types';
import { DEFAULT_EFFECT_SEED } from '../utils/seeded-random';
import { jitterTone } from '../utils/boil-jitter';
import { prepareDitherTone } from './dither/prepare-tone';
import { ditherMono } from './dither/mono-dither';
import { ditherWithPalette } from './dither/palette/palette-dither';
import { monoDitherResult, paletteDitherResult } from './dither/dither-output';

const DEFAULT_METHOD = 'floyd-steinberg';
const DEFAULT_ERROR_GAIN = 1;
const BOIL_TONE_AMPLITUDE = 10;

const boiledData = (ctx: TransformContext): Float32Array =>
  ctx.boilSeed === undefined ? ctx.data : jitterTone(ctx.data, ctx.boilSeed, BOIL_TONE_AMPLITUDE);

export const DitherPlugin: ImagePlugin = {
  id: 'dither',
  name: 'Dithering',
  category: 'Textures',
  transform: (ctx: TransformContext): TransformationResult => {
    const { width, height, palette } = ctx;
    const data = boiledData(ctx);
    const method = ctx.ditherMethod ?? DEFAULT_METHOD;
    const errorGain = ctx.ditherFactor ?? DEFAULT_ERROR_GAIN;
    const seed = ctx.boilSeed ?? ctx.frameSeed ?? DEFAULT_EFFECT_SEED;

    if (palette && palette.colors.length > 0) {
      const processed = ditherWithPalette({ data, width, height, method, errorGain, seed, palette });
      return paletteDitherResult(processed, width, height);
    }

    const tone = prepareDitherTone(data, width, height);
    const ink = ditherMono({ tone, width, height, method, errorGain, seed });
    return monoDitherResult(ink, ctx.data, width, height, ctx.isColor, ctx.paperColor);
  }
};

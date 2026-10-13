import type { ImagePlugin, TransformContext, TransformationResult } from '../types';
import { DEFAULT_EFFECT_SEED } from '../utils/seeded-random';
import { prepareDitherTone } from './dither/prepare-tone';
import { ditherMono } from './dither/mono-dither';
import { ditherWithPalette } from './dither/palette-dither';
import { monoDitherResult, paletteDitherResult } from './dither/dither-output';

const DEFAULT_METHOD = 'floyd-steinberg';
const DEFAULT_ERROR_GAIN = 1;

export const DitherPlugin: ImagePlugin = {
  id: 'dither',
  name: 'Dithering',
  category: 'Textures',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height, palette } = ctx;
    const method = ctx.ditherMethod ?? DEFAULT_METHOD;
    const errorGain = ctx.ditherFactor ?? DEFAULT_ERROR_GAIN;
    const seed = ctx.frameSeed ?? DEFAULT_EFFECT_SEED;

    if (palette && palette.colors.length > 0) {
      const processed = ditherWithPalette({ data, width, height, method, errorGain, seed, palette });
      return paletteDitherResult(processed, width, height);
    }

    const tone = prepareDitherTone(data, width, height);
    const ink = ditherMono({ tone, width, height, method, errorGain, seed });
    return monoDitherResult(ink, data, width, height, ctx.isColor, ctx.paperColor);
  }
};

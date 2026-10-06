import type { ImagePlugin, TransformContext, TransformationResult } from '../types';
import { createSeededRandom, DEFAULT_EFFECT_SEED } from '../utils/seeded-random';

const DEFAULT_GRAIN_AMOUNT = 0.12;
const GRAIN_STRENGTH_SCALE = 110;

export const GrainPlugin: ImagePlugin = {
  id: 'grain',
  name: 'Film Grain',
  category: 'Creative',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height, noise } = ctx;
    const colorData = new Uint8ClampedArray(width * height * 4);
    const workingData = new Float32Array(data.length);
    const strength = Math.max(0, noise ?? DEFAULT_GRAIN_AMOUNT) * GRAIN_STRENGTH_SCALE;
    const random = createSeededRandom(ctx.frameSeed ?? DEFAULT_EFFECT_SEED);

    for (let i = 0; i < data.length; i += 4) {
      const r0 = data[i];
      const g0 = data[i + 1];
      const b0 = data[i + 2];
      const luma = (r0 * 0.2126 + g0 * 0.7152 + b0 * 0.0722) / 255;
      const shadowBoost = 0.55 + 0.9 * (1 - luma);
      const grain = (random() - 0.5) * strength * shadowBoost;

      const r = r0 + grain;
      const g = g0 + grain;
      const b = b0 + grain;

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

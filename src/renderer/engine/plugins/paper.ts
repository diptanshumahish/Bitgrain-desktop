import type { ImagePlugin, TransformContext, TransformationResult } from '../types';

const CREASE_FRACTION = 0.006;
const CREASE_MIN = 2;
const FOLD_AMPLITUDE = 230;

const creaseProfile = (distance: number, halfWidth: number): number => {
  const t = distance / halfWidth;
  if (t < -1 || t > 1) return 0;
  return t * (1 - t * t);
};

export const FoldPlugin: ImagePlugin = {
  id: 'fold',
  name: 'Fold',
  category: 'Textures',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const folds = Math.max(1, Math.min(24, Math.round(ctx.foldCount ?? 2)));
    const intensity = Math.max(0, Math.min(1, ctx.foldIntensity ?? 0.4));
    const size = width * height * 4;
    const colorData = new Uint8ClampedArray(size);
    const workingData = new Float32Array(size);
    const halfWidth = Math.max(CREASE_MIN, Math.round(Math.min(width, height) * CREASE_FRACTION));
    const amplitude = intensity * FOLD_AMPLITUDE;

    const verticalDelta = new Float32Array(width);
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      for (let k = 1; k <= folds; k += 1) {
        sum += creaseProfile(x - (width * k) / (folds + 1), halfWidth);
      }
      verticalDelta[x] = sum;
    }
    const horizontalDelta = new Float32Array(height);
    for (let y = 0; y < height; y += 1) {
      let sum = 0;
      for (let k = 1; k <= folds; k += 1) {
        sum += creaseProfile(y - (height * k) / (folds + 1), halfWidth);
      }
      horizontalDelta[y] = sum;
    }

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const delta = (verticalDelta[x] + horizontalDelta[y]) * amplitude;
        const i = (y * width + x) * 4;
        const r = data[i] + delta;
        const g = data[i + 1] + delta;
        const b = data[i + 2] + delta;
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

const createRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const SPECK_DENSITY = 0.0009;

export const DustPlugin: ImagePlugin = {
  id: 'dust',
  name: 'Dust & scratches',
  category: 'Textures',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const amount = Math.max(0, Math.min(1, ctx.dustAmount ?? 0.3));
    const scratches = Math.max(0, Math.min(100, Math.round(ctx.dustScratches ?? 3)));
    const seed = Math.round(ctx.dustSeed ?? 7);
    const size = width * height * 4;
    const colorData = new Uint8ClampedArray(size);
    const workingData = new Float32Array(size);
    for (let i = 0; i < size; i += 1) colorData[i] = data[i];

    const random = createRandom((Math.imul(seed + 1, 2654435761)) >>> 0);

    for (let s = 0; s < scratches; s += 1) {
      let x = Math.floor(random() * width);
      const bright = random() < 0.7;
      const strength = 120 + random() * 120;
      const length = Math.floor(height * (0.4 + random() * 0.6));
      const startY = Math.floor(random() * Math.max(1, height - length));
      const value = bright ? strength : -strength;
      for (let y = startY; y < startY + length && y < height; y += 1) {
        if (random() < 0.04) x += random() < 0.5 ? -1 : 1;
        const cx = x < 0 ? 0 : x >= width ? width - 1 : x;
        const idx = (y * width + cx) * 4;
        colorData[idx] = colorData[idx] + value;
        colorData[idx + 1] = colorData[idx + 1] + value;
        colorData[idx + 2] = colorData[idx + 2] + value;
      }
    }

    const speckCount = Math.floor(amount * width * height * SPECK_DENSITY);
    for (let p = 0; p < speckCount; p += 1) {
      const x = Math.floor(random() * width);
      const y = Math.floor(random() * height);
      const value = random() < 0.6 ? 255 : 0;
      const speckSize = random() < 0.85 ? 1 : 2;
      for (let dy = 0; dy < speckSize; dy += 1) {
        for (let dx = 0; dx < speckSize; dx += 1) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx >= width || yy >= height) continue;
          const idx = (yy * width + xx) * 4;
          colorData[idx] = value;
          colorData[idx + 1] = value;
          colorData[idx + 2] = value;
        }
      }
    }

    for (let i = 0; i < size; i += 4) colorData[i + 3] = 255;
    for (let i = 0; i < size; i += 1) workingData[i] = colorData[i];

    return { colorData, workingData };
  },
};

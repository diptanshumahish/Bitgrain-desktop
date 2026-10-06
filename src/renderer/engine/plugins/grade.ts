import type { ImagePlugin, TransformContext, TransformationResult } from '../types';

const DUOTONE_DEFAULT_SHADOW: [number, number, number] = [30, 27, 75];
const DUOTONE_DEFAULT_HIGHLIGHT: [number, number, number] = [253, 230, 138];
const WASH_DEFAULT: [number, number, number] = [59, 130, 246];

const TEMPERATURE_RANGE = 45;
const TINT_RANGE = 40;
const MIDPOINT = 128;
const DEFAULT_TEMPERATURE = 16;
const DEFAULT_VIBRANCE = 32;
const DEFAULT_CONTRAST = 0.16;
const DEFAULT_SPLIT = 14;

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function luma(r: number, g: number, b: number): number {
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

function allocate(size: number): {
  colorData: Uint8ClampedArray;
  workingData: Float32Array;
} {
  return {
    colorData: new Uint8ClampedArray(size),
    workingData: new Float32Array(size),
  };
}

function write(
  colorData: Uint8ClampedArray,
  workingData: Float32Array,
  i: number,
  r: number,
  g: number,
  b: number,
): void {
  workingData[i] = r;
  workingData[i + 1] = g;
  workingData[i + 2] = b;
  workingData[i + 3] = 255;
  colorData[i] = r;
  colorData[i + 1] = g;
  colorData[i + 2] = b;
  colorData[i + 3] = 255;
}

export const ColorGradePlugin: ImagePlugin = {
  id: 'colorgrade',
  name: 'Color Grade',
  category: 'Filters',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const hasParams =
      ctx.gradeTemperature !== undefined ||
      ctx.gradeTint !== undefined ||
      ctx.gradeVibrance !== undefined;
    const temperature = (ctx.gradeTemperature ?? (hasParams ? 0 : DEFAULT_TEMPERATURE)) / 100;
    const tint = (ctx.gradeTint ?? 0) / 100;
    const vibrance = (ctx.gradeVibrance ?? (hasParams ? 0 : DEFAULT_VIBRANCE)) / 100;
    const contrast = hasParams ? 0 : DEFAULT_CONTRAST;
    const split = hasParams ? 0 : DEFAULT_SPLIT;
    const size = width * height * 4;
    const { colorData, workingData } = allocate(size);

    for (let i = 0; i < size; i += 4) {
      let r = data[i] + temperature * TEMPERATURE_RANGE;
      let g = data[i + 1] - tint * TINT_RANGE;
      let b = data[i + 2] - temperature * TEMPERATURE_RANGE;

      if (vibrance !== 0) {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = (max - min) / 255;
        const boost = vibrance * (1 - saturation);
        const l = luma(r, g, b);
        r = l + (r - l) * (1 + boost);
        g = l + (g - l) * (1 + boost);
        b = l + (b - l) * (1 + boost);
      }

      if (contrast !== 0) {
        r = MIDPOINT + (r - MIDPOINT) * (1 + contrast);
        g = MIDPOINT + (g - MIDPOINT) * (1 + contrast);
        b = MIDPOINT + (b - MIDPOINT) * (1 + contrast);
      }

      if (split !== 0) {
        const tone = luma(r, g, b) / 255 - 0.5;
        r += tone * split;
        b -= tone * split;
      }

      write(colorData, workingData, i, r, g, b);
    }
    return { colorData, workingData };
  },
};

export const DuotonePlugin: ImagePlugin = {
  id: 'duotone',
  name: 'Duotone',
  category: 'Filters',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const [sr, sg, sb] = ctx.duotoneShadow ?? DUOTONE_DEFAULT_SHADOW;
    const [hr, hg, hb] = ctx.duotoneHighlight ?? DUOTONE_DEFAULT_HIGHLIGHT;
    const amount = clamp01(ctx.duotoneAmount ?? 1);
    const size = width * height * 4;
    const { colorData, workingData } = allocate(size);

    for (let i = 0; i < size; i += 4) {
      const t = luma(data[i], data[i + 1], data[i + 2]) / 255;
      const dr = sr + (hr - sr) * t;
      const dg = sg + (hg - sg) * t;
      const db = sb + (hb - sb) * t;
      const r = data[i] + (dr - data[i]) * amount;
      const g = data[i + 1] + (dg - data[i + 1]) * amount;
      const b = data[i + 2] + (db - data[i + 2]) * amount;
      write(colorData, workingData, i, r, g, b);
    }
    return { colorData, workingData };
  },
};

export const VignettePlugin: ImagePlugin = {
  id: 'vignette',
  name: 'Vignette',
  category: 'Filters',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const amount = clamp01(ctx.vignetteAmount ?? 0.5);
    const radius = clamp01(ctx.vignetteRadius ?? 0.7);
    const softness = Math.max(0.001, clamp01(ctx.vignetteSoftness ?? 0.5));
    const size = width * height * 4;
    const { colorData, workingData } = allocate(size);

    const cx = width / 2;
    const cy = height / 2;
    const maxDist = Math.hypot(cx, cy);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const dist = Math.hypot(x - cx, y - cy) / maxDist;
        const t = clamp01((dist - radius) / softness);
        const smooth = t * t * (3 - 2 * t);
        const mul = 1 - amount * smooth;
        write(
          colorData,
          workingData,
          i,
          data[i] * mul,
          data[i + 1] * mul,
          data[i + 2] * mul,
        );
      }
    }
    return { colorData, workingData };
  },
};

export const PosterizePlugin: ImagePlugin = {
  id: 'posterize',
  name: 'Posterize',
  category: 'Filters',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const levels = Math.max(2, Math.min(64, Math.round(ctx.posterizeLevels ?? 6)));
    const step = 255 / (levels - 1);
    const size = width * height * 4;
    const { colorData, workingData } = allocate(size);

    for (let i = 0; i < size; i += 4) {
      write(
        colorData,
        workingData,
        i,
        Math.round(data[i] / step) * step,
        Math.round(data[i + 1] / step) * step,
        Math.round(data[i + 2] / step) * step,
      );
    }
    return { colorData, workingData };
  },
};

const GAUSSIAN_KERNEL = [1, 2, 1, 2, 4, 2, 1, 2, 1];
const GAUSSIAN_WEIGHT = 16;
const SHARPEN_DEFAULT = 0.8;

export const SharpenPlugin: ImagePlugin = {
  id: 'sharpen',
  name: 'Sharpen',
  category: 'Filters',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const amount = Math.max(0, ctx.sharpenAmount ?? SHARPEN_DEFAULT);
    const size = width * height * 4;
    const { colorData, workingData } = allocate(size);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        for (let c = 0; c < 3; c++) {
          let blurred = 0;
          let kernelIndex = 0;
          for (let dy = -1; dy <= 1; dy++) {
            const sy = Math.min(height - 1, Math.max(0, y + dy));
            for (let dx = -1; dx <= 1; dx++) {
              const sx = Math.min(width - 1, Math.max(0, x + dx));
              blurred += data[(sy * width + sx) * 4 + c] * GAUSSIAN_KERNEL[kernelIndex];
              kernelIndex++;
            }
          }
          blurred /= GAUSSIAN_WEIGHT;
          const value = data[i + c] + amount * (data[i + c] - blurred);
          workingData[i + c] = value;
          colorData[i + c] = value;
        }
        workingData[i + 3] = 255;
        colorData[i + 3] = 255;
      }
    }
    return { colorData, workingData };
  },
};

function blendChannel(
  base: number,
  wash: number,
  mode: 'screen' | 'overlay' | 'multiply',
): number {
  if (mode === 'multiply') return (base * wash) / 255;
  if (mode === 'overlay') {
    return base < 128
      ? (2 * base * wash) / 255
      : 255 - (2 * (255 - base) * (255 - wash)) / 255;
  }
  return 255 - ((255 - base) * (255 - wash)) / 255;
}

export const ColorWashPlugin: ImagePlugin = {
  id: 'colorwash',
  name: 'Color Wash',
  category: 'Filters',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const [wr, wg, wb] = ctx.washColor ?? WASH_DEFAULT;
    const intensity = clamp01(ctx.washIntensity ?? 0.4);
    const mode = ctx.washMode ?? 'screen';
    const size = width * height * 4;
    const { colorData, workingData } = allocate(size);

    for (let i = 0; i < size; i += 4) {
      const r = data[i] + (blendChannel(data[i], wr, mode) - data[i]) * intensity;
      const g = data[i + 1] + (blendChannel(data[i + 1], wg, mode) - data[i + 1]) * intensity;
      const b = data[i + 2] + (blendChannel(data[i + 2], wb, mode) - data[i + 2]) * intensity;
      write(colorData, workingData, i, r, g, b);
    }
    return { colorData, workingData };
  },
};

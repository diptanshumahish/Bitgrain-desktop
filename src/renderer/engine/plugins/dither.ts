import type { ImagePlugin, TransformContext, TransformationResult, DitherMethod, Palette } from '../types';
import { BLUE_NOISE_16 } from '../BlueNoise';
import { getNearestColor } from '../utils/color';
import { createSeededRandom, DEFAULT_EFFECT_SEED } from '../utils/seeded-random';

const BAYER_2 = [
  [0, 2],
  [3, 1]
];

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

const BAYER_8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21]
];

export const DitherPlugin: ImagePlugin = {
  id: 'dither',
  name: 'Dithering',
  category: 'Textures',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height, ditherMethod = 'floyd-steinberg', ditherFactor = 1, palette } = ctx;
    
    // Create a copy of the data for processing to avoid side effects
    const processedData = new Float32Array(data);

    if (ditherMethod === 'threshold') {
      applyThreshold(processedData, palette);
    } else if (ditherMethod.startsWith('bayer-')) {
      applyOrderedDither(processedData, width, height, ditherMethod, palette);
    } else if (ditherMethod === 'blue-noise') {
      applyBlueNoiseDither(processedData, width, height, palette);
    } else if (ditherMethod === 'random') {
      applyRandomDither(processedData, ctx.frameSeed ?? DEFAULT_EFFECT_SEED, palette);
    } else {
      applyErrorDiffusion(processedData, width, height, ditherMethod, ditherFactor, palette);
    }

    const { text, charData, colorData } = getDrawingData(processedData, data, width, height, ctx.isColor, !!palette);
    return { text, charData, colorData, workingData: processedData };
  }
};

const getDrawingData = (processed: Float32Array, original: Float32Array, w: number, h: number, isColor: boolean, hasPalette: boolean) => {
  let text = '';
  const charData: string[] = [];
  const colorData = new Uint8ClampedArray(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const v = processed[i]; // Dithered value (0 or 255 or palette color)
      const char = hasPalette || v <= 128 ? '█' : ' ';
      text += char;
      charData.push(char);
      
      if (hasPalette) {
        // Use snapped palette colors from processed data
        colorData[i] = Math.floor(Math.min(255, Math.max(0, processed[i])));
        colorData[i+1] = Math.floor(Math.min(255, Math.max(0, processed[i+1])));
        colorData[i+2] = Math.floor(Math.min(255, Math.max(0, processed[i+2])));
      } else if (isColor) {
        // Use original colors for Chroma engine
        colorData[i] = Math.floor(Math.min(255, Math.max(0, original[i])));
        colorData[i+1] = Math.floor(Math.min(255, Math.max(0, original[i+1])));
        colorData[i+2] = Math.floor(Math.min(255, Math.max(0, original[i+2])));
      } else {
        // Grayscale output
        colorData[i] = colorData[i+1] = colorData[i+2] = v > 128 ? 255 : 0;
      }
      colorData[i+3] = 255;
    }
    text += '\n';
  }
  return { text, charData, colorData };
};

const applyThreshold = (data: Float32Array, palette?: Palette) => {
  for (let i = 0; i < data.length; i += 4) {
    if (palette) {
      const [r, g, b] = getNearestColor(data[i], data[i+1], data[i+2], palette);
      data[i] = r; data[i+1] = g; data[i+2] = b;
    } else {
      const v = (data[i] * 0.2126 + data[i+1] * 0.7152 + data[i+2] * 0.0722) > 128 ? 255 : 0;
      data[i] = data[i+1] = data[i+2] = v;
    }
  }
};

const applyRandomDither = (data: Float32Array, seed: number, palette?: Palette) => {
  const random = createSeededRandom(seed);
  for (let i = 0; i < data.length; i += 4) {
    if (palette) {
      const r = data[i] + (random() - 0.5) * 128;
      const g = data[i+1] + (random() - 0.5) * 128;
      const b = data[i+2] + (random() - 0.5) * 128;
      const [nr, ng, nb] = getNearestColor(r, g, b, palette);
      data[i] = nr; data[i+1] = ng; data[i+2] = nb;
    } else {
      const v = (data[i] * 0.2126 + data[i+1] * 0.7152 + data[i+2] * 0.0722) > random() * 255 ? 255 : 0;
      data[i] = data[i+1] = data[i+2] = v;
    }
  }
};

const applyOrderedDither = (data: Float32Array, w: number, h: number, method: string, palette?: Palette) => {
  const matrix = method === 'bayer-2' ? BAYER_2 : method === 'bayer-4' ? BAYER_4 : BAYER_8;
  const size = matrix.length;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const threshold = (matrix[y % size][x % size] / (size * size)) * 255;
      
      if (palette) {
        const r = data[i] + (threshold - 128);
        const g = data[i+1] + (threshold - 128);
        const b = data[i+2] + (threshold - 128);
        const [nr, ng, nb] = getNearestColor(r, g, b, palette);
        data[i] = nr; data[i+1] = ng; data[i+2] = nb;
      } else {
        const oldV = (data[i] * 0.2126 + data[i+1] * 0.7152 + data[i+2] * 0.0722);
        const newV = oldV > threshold ? 255 : 0;
        data[i] = data[i+1] = data[i+2] = newV;
      }
    }
  }
};

const applyErrorDiffusion = (data: Float32Array, w: number, h: number, method: DitherMethod, factorMultiplier: number, palette?: Palette) => {
  let kernel: [number, number, number][] = [];
  switch (method) {
    case 'floyd-steinberg': 
      kernel = [[1, 0, 7/16], [-1, 1, 3/16], [0, 1, 5/16], [1, 1, 1/16]]; break;
    case 'atkinson': 
      kernel = [[1, 0, 1/8], [2, 0, 1/8], [-1, 1, 1/8], [0, 1, 1/8], [1, 1, 1/8], [0, 2, 1/8]]; break;
    case 'burkes': 
      kernel = [[1, 0, 8/32], [2, 0, 4/32], [-2, 1, 2/32], [-1, 1, 4/32], [0, 1, 8/32], [1, 1, 4/32], [2, 1, 2/32]]; break;
    case 'stucki': 
      kernel = [[1, 0, 8/42], [2, 0, 4/42], [-2, 1, 2/42], [-1, 1, 4/42], [0, 1, 8/42], [1, 1, 4/42], [2, 1, 2/42], [-2, 2, 1/42], [-1, 2, 2/42], [0, 2, 4/42], [1, 2, 2/42], [2, 2, 1/42]]; break;
    case 'jjn': 
      kernel = [[1, 0, 7/48], [2, 0, 5/48], [-2, 1, 3/48], [-1, 1, 5/48], [0, 1, 7/48], [1, 1, 5/48], [2, 1, 3/48], [-2, 2, 1/48], [-1, 2, 3/48], [0, 2, 5/48], [1, 2, 3/48], [2, 2, 1/48]]; break;
    case 'sierra': 
      kernel = [[1, 0, 5/32], [2, 0, 3/32], [-2, 1, 2/32], [-1, 1, 4/32], [0, 1, 5/32], [1, 1, 4/32], [2, 1, 2/32], [-1, 2, 2/32], [0, 2, 3/32], [1, 2, 2/32]]; break;
    case 'sierra-2': 
      kernel = [[1, 0, 4/16], [2, 0, 3/16], [-2, 1, 1/16], [-1, 1, 2/16], [0, 1, 3/16], [1, 1, 2/16], [2, 1, 1/16]]; break;
    case 'sierra-lite': 
      kernel = [[1, 0, 2/4], [-1, 1, 1/4], [0, 1, 1/4]]; break;
  }

  for (let y = 0; y < h; y++) {
    const leftToRight = (y & 1) === 0;
    const xStart = leftToRight ? 0 : w - 1;
    const xEnd = leftToRight ? w : -1;
    const xStep = leftToRight ? 1 : -1;
    const dirX = leftToRight ? 1 : -1;

    for (let x = xStart; x !== xEnd; x += xStep) {
      const i = (y * w + x) * 4;

      let newR, newG, newB;
      let errR, errG, errB;

      if (palette) {
        [newR, newG, newB] = getNearestColor(data[i], data[i+1], data[i+2], palette);
        errR = (data[i] - newR) * factorMultiplier;
        errG = (data[i+1] - newG) * factorMultiplier;
        errB = (data[i+2] - newB) * factorMultiplier;
      } else {
        const oldV = (data[i] * 0.2126 + data[i+1] * 0.7152 + data[i+2] * 0.0722);
        const newV = oldV > 128 ? 255 : 0;
        const err = (oldV - newV) * factorMultiplier;
        newR = newG = newB = newV;
        errR = errG = errB = err;
      }

      data[i] = newR; data[i+1] = newG; data[i+2] = newB;

      for (const [dx, dy, factor] of kernel) {
        distributeError(data, x + dx * dirX, y + dy, w, h, errR * factor, errG * factor, errB * factor);
      }
    }
  }
};

const distributeError = (data: Float32Array, x: number, y: number, w: number, h: number, errR: number, errG: number, errB: number) => {
  if (x < 0 || x >= w || y < 0 || y >= h) return;
  const i = (y * w + x) * 4;
  data[i] += errR;
  data[i+1] += errG;
  data[i+2] += errB;
};

const applyBlueNoiseDither = (data: Float32Array, w: number, h: number, palette?: Palette) => {
  const size = 16;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const threshold = BLUE_NOISE_16[y % size][x % size];
      
      if (palette) {
        const r = data[i] + (threshold - 128);
        const g = data[i+1] + (threshold - 128);
        const b = data[i+2] + (threshold - 128);
        const [nr, ng, nb] = getNearestColor(r, g, b, palette);
        data[i] = nr; data[i+1] = ng; data[i+2] = nb;
      } else {
        const oldV = (data[i] * 0.2126 + data[i+1] * 0.7152 + data[i+2] * 0.0722);
        const newV = oldV > threshold ? 255 : 0;
        data[i] = data[i+1] = data[i+2] = newV;
      }
    }
  }
};

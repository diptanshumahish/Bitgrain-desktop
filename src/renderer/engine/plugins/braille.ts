import type { ImagePlugin, TransformContext, TransformationResult } from '../types';
import { writeLiftedColour } from '../tone/lift-colour';

const DOT_BITS = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
];

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const BAYER_LEVELS = 16;
const BYTE_MAX = 255;
const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;
const TONE_GAMMA = 0.6;
const COLOR_LIFT = 0.75;
const BRAILLE_BASE = 0x2800;
const DOTS_WIDE = 2;
const DOTS_TALL = 4;

export const BRAILLE_CELL_W = 8;
export const BRAILLE_CELL_H = 14;
export const BRAILLE_TARGET_COLS = 120;

const applyContrast = (value: number, contrast: number): number =>
  ((value / BYTE_MAX - 0.5) * contrast + 0.5) * BYTE_MAX;

const liftedTone = (r: number, g: number, b: number): number => {
  const luma = Math.max(0, Math.min(BYTE_MAX, r * LUMA_R + g * LUMA_G + b * LUMA_B)) / BYTE_MAX;
  return Math.pow(luma, TONE_GAMMA);
};

export const BraillePlugin: ImagePlugin = {
  id: 'braille',
  name: 'Braille',
  category: 'Textures',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height, contrast, isColor } = ctx;
    const outCols = Math.floor(width / DOTS_WIDE);
    const outRows = Math.floor(height / DOTS_TALL);
    const charData: string[] = new Array(outCols * outRows);
    const colorData = isColor ? new Uint8ClampedArray(outCols * outRows * 4) : undefined;
    let text = '';

    for (let by = 0; by < outRows; by++) {
      for (let bx = 0; bx < outCols; bx++) {
        let mask = 0;
        let rSum = 0, gSum = 0, bSum = 0, lit = 0;

        for (let dy = 0; dy < DOTS_TALL; dy++) {
          for (let dx = 0; dx < DOTS_WIDE; dx++) {
            const sx = bx * DOTS_WIDE + dx;
            const sy = by * DOTS_TALL + dy;
            const i = (sy * width + sx) * 4;
            const r = applyContrast(data[i], contrast);
            const g = applyContrast(data[i + 1], contrast);
            const b = applyContrast(data[i + 2], contrast);
            const threshold = (BAYER4[sy & 3][sx & 3] + 0.5) / BAYER_LEVELS;
            if (liftedTone(r, g, b) > threshold) {
              mask |= DOT_BITS[dy][dx];
              if (isColor) { rSum += r; gSum += g; bSum += b; lit++; }
            }
          }
        }

        const idx = by * outCols + bx;
        const char = mask === 0 ? ' ' : String.fromCharCode(BRAILLE_BASE + mask);
        charData[idx] = char;
        text += char;

        if (colorData && lit > 0) {
          writeLiftedColour(colorData, idx * 4, rSum / lit, gSum / lit, bSum / lit, COLOR_LIFT);
        }
      }
      text += '\n';
    }

    return { text, charData, colorData, gridWidth: outCols, gridHeight: outRows };
  },
};

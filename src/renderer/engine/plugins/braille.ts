import type { ImagePlugin, TransformContext, TransformationResult } from '../types';

// A braille glyph (U+2800 + 8-bit mask) packs a 2-wide x 4-tall dot grid, giving
// ~4x the detail of a normal ASCII cell. Bits map to the standard dot positions.
const DOT_BITS = [
  [0x01, 0x08], // row 0: left dot, right dot
  [0x02, 0x10], // row 1
  [0x04, 0x20], // row 2
  [0x40, 0x80], // row 3
];

// Ordered Bayer 4x4 gives deterministic tonal gradients across the dot grid.
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export const BRAILLE_CELL_W = 8;
export const BRAILLE_CELL_H = 14;
export const BRAILLE_TARGET_COLS = 120;

export const BraillePlugin: ImagePlugin = {
  id: 'braille',
  name: 'Braille',
  category: 'Textures',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height, contrast, isColor } = ctx;
    const outCols = Math.floor(width / 2);
    const outRows = Math.floor(height / 4);
    const charData: string[] = new Array(outCols * outRows);
    const colorData = isColor ? new Uint8ClampedArray(outCols * outRows * 4) : undefined;
    let text = '';

    for (let by = 0; by < outRows; by++) {
      for (let bx = 0; bx < outCols; bx++) {
        let mask = 0;
        let rSum = 0, gSum = 0, bSum = 0, lit = 0;

        for (let dy = 0; dy < 4; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const sx = bx * 2 + dx;
            const sy = by * 4 + dy;
            const i = (sy * width + sx) * 4;
            let r = data[i], g = data[i + 1], b = data[i + 2];
            r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
            g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
            b = ((b / 255 - 0.5) * contrast + 0.5) * 255;
            const lumNorm = Math.max(0, Math.min(255, r * 0.2126 + g * 0.7152 + b * 0.0722)) / 255;
            const threshold = (BAYER4[sy & 3][sx & 3] + 0.5) / 16;
            if (lumNorm > threshold) {
              mask |= DOT_BITS[dy][dx];
              if (isColor) { rSum += r; gSum += g; bSum += b; lit++; }
            }
          }
        }

        const idx = by * outCols + bx;
        const char = mask === 0 ? ' ' : String.fromCharCode(0x2800 + mask);
        charData[idx] = char;
        text += char;

        if (isColor && colorData && lit > 0) {
          colorData[idx * 4] = Math.min(255, Math.max(0, rSum / lit));
          colorData[idx * 4 + 1] = Math.min(255, Math.max(0, gSum / lit));
          colorData[idx * 4 + 2] = Math.min(255, Math.max(0, bSum / lit));
          colorData[idx * 4 + 3] = 255;
        }
      }
      text += '\n';
    }

    return { text, charData, colorData, gridWidth: outCols, gridHeight: outRows };
  },
};

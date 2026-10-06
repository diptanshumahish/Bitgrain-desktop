import type { ImagePlugin, TransformContext, TransformationResult } from '../types';

// Topographic contour lines: quantize luminance into bands and ink the boundaries
// between them. Optionally fill the bands (posterized) under the lines.
const PAPER: [number, number, number] = [242, 239, 230];
const INK: [number, number, number] = [22, 22, 18];

const lumaAt = (data: Float32Array, i: number, contrast: number): number => {
  let r = data[i], g = data[i + 1], b = data[i + 2];
  r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
  g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
  b = ((b / 255 - 0.5) * contrast + 0.5) * 255;
  return Math.max(0, Math.min(255, r * 0.2126 + g * 0.7152 + b * 0.0722));
};

export const ContourPlugin: ImagePlugin = {
  id: 'contour',
  name: 'Contour',
  category: 'Filters',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height, contrast, isColor, contourLevels, contourFill } = ctx;
    const levels = Math.max(2, Math.min(24, Math.round(contourLevels ?? 8)));
    const fill = contourFill === true;
    const out = new Uint8ClampedArray(width * height * 4);

    const band = new Uint8Array(width * height);
    for (let p = 0; p < width * height; p++) {
      const lum = lumaAt(data, p * 4, contrast);
      band[p] = Math.min(levels - 1, Math.floor((lum / 255) * levels));
    }

    const q = (c: number): number => (Math.round((c / 255) * (levels - 1)) / (levels - 1)) * 255;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = y * width + x;
        const i = p * 4;
        const edge =
          (x + 1 < width && band[p] !== band[p + 1]) ||
          (y + 1 < height && band[p] !== band[p + width]);

        if (edge) {
          out[i] = INK[0]; out[i + 1] = INK[1]; out[i + 2] = INK[2];
        } else if (fill) {
          if (isColor) {
            out[i] = q(data[i]); out[i + 1] = q(data[i + 1]); out[i + 2] = q(data[i + 2]);
          } else {
            const tone = (band[p] / (levels - 1)) * 255;
            out[i] = tone; out[i + 1] = tone; out[i + 2] = tone;
          }
        } else {
          out[i] = PAPER[0]; out[i + 1] = PAPER[1]; out[i + 2] = PAPER[2];
        }
        out[i + 3] = 255;
      }
    }

    return { colorData: out };
  },
};

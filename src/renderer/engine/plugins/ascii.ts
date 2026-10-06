import type { AsciiTone, ImagePlugin, TransformContext, TransformationResult } from '../types';

// Luminance-ordered ramps, sparse (dark) -> dense (bright).
export const ASCII_STANDARD = ' .:-=+*#%@';
export const ASCII_BLOCKS = ' ░▒▓█';
export const ASCII_DETAILED = " .,:;i!lI><~+_-?)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
export const ASCII_CODE = " .,:;-+=iltfjrxnuvcz235789XYUJCLQ0OZkbdpqhao#MW&8%B@$";

const DEFAULT_RAMP = ASCII_DETAILED;

// On a light surface, dark pixels become the densest ink, so the ramp flips.
export const orientRamp = (ramp: string, tone: AsciiTone): string =>
  tone === "light" ? [...ramp].reverse().join("") : ramp;

// Rendering geometry. ASCII uses a fixed legible column target (scaled by detail)
// instead of the source resolution, so glyphs stay readable on any image size.
export const ASCII_CELL_W = 8;
export const ASCII_CELL_H = 14;
export const ASCII_TARGET_COLS = 160;

export const AsciiPlugin: ImagePlugin = {
  id: 'ascii',
  name: 'ASCII Art',
  category: 'Textures',
  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height, contrast, isColor, asciiCharset, asciiEdges, asciiEdgeThreshold } = ctx;
    const chars = asciiCharset && asciiCharset.length > 1 ? asciiCharset : DEFAULT_RAMP;
    const lastIdx = chars.length - 1;
    const colorData = isColor ? new Uint8ClampedArray(width * height * 4) : undefined;
    const lum = new Float32Array(width * height);

    // First pass: contrast-adjusted luminance grid (+ per-cell color when enabled).
    for (let p = 0; p < width * height; p++) {
      const i = p * 4;
      let r = data[i], g = data[i + 1], b = data[i + 2];
      r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
      g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
      b = ((b / 255 - 0.5) * contrast + 0.5) * 255;
      lum[p] = Math.max(0, Math.min(255, r * 0.2126 + g * 0.7152 + b * 0.0722));
      if (isColor && colorData) {
        colorData[i] = Math.floor(Math.min(255, Math.max(0, r)));
        colorData[i + 1] = Math.floor(Math.min(255, Math.max(0, g)));
        colorData[i + 2] = Math.floor(Math.min(255, Math.max(0, b)));
        colorData[i + 3] = 255;
      }
    }

    // Second pass: density chars, overridden by a directional glyph at strong edges.
    const edgesOn = asciiEdges === true;
    const threshold = (1 - (asciiEdgeThreshold ?? 0.5)) * 90 + 6;
    const charData: string[] = [];
    let text = '';

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = y * width + x;
        let char = chars[Math.floor((lum[p] / 255) * lastIdx)];

        if (edgesOn && x > 0 && x < width - 1 && y > 0 && y < height - 1) {
          const tl = lum[p - width - 1], t = lum[p - width], tr = lum[p - width + 1];
          const l = lum[p - 1], rg = lum[p + 1];
          const bl = lum[p + width - 1], bt = lum[p + width], br = lum[p + width + 1];
          const gx = (tr + 2 * rg + br) - (tl + 2 * l + bl);
          const gy = (bl + 2 * bt + br) - (tl + 2 * t + tr);
          if (gx * gx + gy * gy > threshold * threshold) {
            let angle = Math.atan2(gy, gx);
            if (angle < 0) angle += Math.PI;
            const deg = (angle * 180) / Math.PI;
            char = deg < 22.5 || deg >= 157.5 ? '|' : deg < 67.5 ? '/' : deg < 112.5 ? '-' : '\\';
          }
        }

        charData.push(char);
        text += char;
      }
      text += '\n';
    }

    return { text, charData, colorData };
  }
};

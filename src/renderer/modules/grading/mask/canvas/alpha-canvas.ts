import { createCanvas } from "../../../../engine/selective/brush-canvas";

export const MASK_WORKING_MAX = 1024;

const CHANNEL_MAX = 255;

export type AlphaSource = Float32Array | Uint8ClampedArray;

const alphaScale = (alpha: AlphaSource): number => (alpha instanceof Uint8ClampedArray ? 1 : CHANNEL_MAX);

export const alphaToCanvas = (alpha: AlphaSource, width: number, height: number, rgb: [number, number, number] = [CHANNEL_MAX, CHANNEL_MAX, CHANNEL_MAX]): HTMLCanvasElement => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const image = ctx.createImageData(width, height);
  const scale = alphaScale(alpha);
  for (let index = 0; index < alpha.length; index += 1) {
    const offset = index * 4;
    image.data[offset] = rgb[0];
    image.data[offset + 1] = rgb[1];
    image.data[offset + 2] = rgb[2];
    image.data[offset + 3] = alpha[index] * scale;
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
};

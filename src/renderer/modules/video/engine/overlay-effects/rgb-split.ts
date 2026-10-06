import type { OverlayEffectContext, OverlayEffectFn } from "./types";

const MAX_OFFSET_PX = 18;
const WOBBLE_RATE = 6;
const WOBBLE_AMOUNT = 0.35;

function clampIndex(value: number, size: number): number {
  if (value < 0) return 0;
  if (value > size - 1) return size - 1;
  return value;
}

export const applyRgbSplit: OverlayEffectFn = (image, context) => {
  const { width, height, time, intensity, speed }: OverlayEffectContext = context;
  if (intensity <= 0) return;

  const dst = image.data;
  const src = new Uint8ClampedArray(dst);
  const wobble = 1 + Math.sin(time * WOBBLE_RATE * speed) * WOBBLE_AMOUNT * speed;
  const offset = Math.round(intensity * MAX_OFFSET_PX * wobble);
  if (offset === 0) return;

  for (let y = 0; y < height; y++) {
    const rowStart = y * width;
    for (let x = 0; x < width; x++) {
      const redX = clampIndex(x - offset, width);
      const blueX = clampIndex(x + offset, width);
      const target = (rowStart + x) * 4;
      dst[target] = src[(rowStart + redX) * 4];
      dst[target + 2] = src[(rowStart + blueX) * 4 + 2];
    }
  }
};

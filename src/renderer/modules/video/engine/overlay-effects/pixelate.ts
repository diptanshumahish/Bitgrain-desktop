import type { OverlayEffectContext, OverlayEffectFn } from "./types";

const MAX_BLOCK_FRACTION = 0.08;
const MIN_BLOCK = 2;

export const applyPixelate: OverlayEffectFn = (image, context) => {
  const { width, height, intensity }: OverlayEffectContext = context;
  if (intensity <= 0) return;

  const dst = image.data;
  const block = Math.max(MIN_BLOCK, Math.round(intensity * width * MAX_BLOCK_FRACTION));
  if (block < MIN_BLOCK) return;

  for (let blockY = 0; blockY < height; blockY += block) {
    for (let blockX = 0; blockX < width; blockX += block) {
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let sumA = 0;
      let count = 0;
      const endY = Math.min(blockY + block, height);
      const endX = Math.min(blockX + block, width);
      for (let y = blockY; y < endY; y++) {
        for (let x = blockX; x < endX; x++) {
          const index = (y * width + x) * 4;
          sumR += dst[index];
          sumG += dst[index + 1];
          sumB += dst[index + 2];
          sumA += dst[index + 3];
          count++;
        }
      }
      const avgR = sumR / count;
      const avgG = sumG / count;
      const avgB = sumB / count;
      const avgA = sumA / count;
      for (let y = blockY; y < endY; y++) {
        for (let x = blockX; x < endX; x++) {
          const index = (y * width + x) * 4;
          dst[index] = avgR;
          dst[index + 1] = avgG;
          dst[index + 2] = avgB;
          dst[index + 3] = avgA;
        }
      }
    }
  }
};

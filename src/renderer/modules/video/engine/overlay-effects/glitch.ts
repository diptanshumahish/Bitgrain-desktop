import type { OverlayEffectContext, OverlayEffectFn } from "./types";
import { hashNoise, signedNoise } from "./noise";

const BAND_COUNT = 28;
const GLITCH_RATE = 14;
const MAX_SHIFT_FRACTION = 0.22;
const MAX_SPLIT_PX = 16;
const GLITCH_DENSITY = 0.55;

function wrap(value: number, size: number): number {
  return ((value % size) + size) % size;
}

export const applyGlitch: OverlayEffectFn = (image, context) => {
  const { width, height, time, intensity, speed }: OverlayEffectContext = context;
  if (intensity <= 0) return;

  const dst = image.data;
  const src = new Uint8ClampedArray(dst);
  const bandHeight = Math.max(1, Math.floor(height / BAND_COUNT));
  const frameSeed = Math.floor(time * (1 + speed * GLITCH_RATE));
  const maxShift = Math.round(intensity * width * MAX_SHIFT_FRACTION);
  const maxSplit = Math.round(intensity * MAX_SPLIT_PX);

  for (let y = 0; y < height; y++) {
    const band = Math.floor(y / bandHeight);
    const active = hashNoise(frameSeed, band) < GLITCH_DENSITY * intensity;
    const offset = active ? Math.round(signedNoise(frameSeed, band * 7 + 1) * maxShift) : 0;
    const split = active ? Math.round(hashNoise(frameSeed, band * 13 + 3) * maxSplit) : 0;
    const rowStart = y * width;

    for (let x = 0; x < width; x++) {
      const baseX = wrap(x - offset, width);
      const redX = wrap(baseX + split, width);
      const blueX = wrap(baseX - split, width);
      const target = (rowStart + x) * 4;
      dst[target] = src[(rowStart + redX) * 4];
      dst[target + 1] = src[(rowStart + baseX) * 4 + 1];
      dst[target + 2] = src[(rowStart + blueX) * 4 + 2];
      dst[target + 3] = src[(rowStart + baseX) * 4 + 3];
    }
  }
};

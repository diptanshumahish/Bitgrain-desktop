import type { OverlayEffectContext, OverlayEffectFn } from "./types";

const MAX_AMPLITUDE_FRACTION = 0.06;
const FREQUENCY = 0.05;
const FLOW_RATE = 3;

function wrap(value: number, size: number): number {
  return ((value % size) + size) % size;
}

export const applyWave: OverlayEffectFn = (image, context) => {
  const { width, height, time, intensity, speed }: OverlayEffectContext = context;
  if (intensity <= 0) return;

  const dst = image.data;
  const src = new Uint8ClampedArray(dst);
  const amplitude = intensity * width * MAX_AMPLITUDE_FRACTION;
  const phase = time * FLOW_RATE * speed;

  for (let y = 0; y < height; y++) {
    const offset = Math.round(Math.sin(y * FREQUENCY + phase) * amplitude);
    if (offset === 0) continue;
    const rowStart = y * width;
    for (let x = 0; x < width; x++) {
      const sourceX = wrap(x - offset, width);
      const target = (rowStart + x) * 4;
      const source = (rowStart + sourceX) * 4;
      dst[target] = src[source];
      dst[target + 1] = src[source + 1];
      dst[target + 2] = src[source + 2];
      dst[target + 3] = src[source + 3];
    }
  }
};

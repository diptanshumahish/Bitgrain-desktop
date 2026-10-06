import type { OverlayEffectContext, OverlayEffectFn } from "./types";

const MIN_SPACING = 2;
const MAX_SPACING = 7;
const MAX_DARKEN = 0.7;
const ROLL_RATE = 40;
const ROLL_BAND = 0.25;

export const applyScanlines: OverlayEffectFn = (image, context) => {
  const { width, height, time, intensity, speed }: OverlayEffectContext = context;
  if (intensity <= 0) return;

  const dst = image.data;
  const spacing = Math.max(MIN_SPACING, Math.round(MAX_SPACING - intensity * (MAX_SPACING - MIN_SPACING)));
  const darken = intensity * MAX_DARKEN;
  const rollCenter = ((time * ROLL_RATE * speed) % height + height) % height;
  const rollHeight = height * ROLL_BAND;

  for (let y = 0; y < height; y++) {
    const isDarkLine = y % spacing === 0;
    const rollDistance = Math.abs(y - rollCenter);
    const rollBoost = speed > 0 && rollDistance < rollHeight
      ? (1 - rollDistance / rollHeight) * 0.25 * intensity
      : 0;
    const factor = 1 - (isDarkLine ? darken : 0) - rollBoost;
    if (factor >= 1) continue;
    const rowStart = y * width * 4;
    for (let x = 0; x < width; x++) {
      const target = rowStart + x * 4;
      dst[target] *= factor;
      dst[target + 1] *= factor;
      dst[target + 2] *= factor;
    }
  }
};

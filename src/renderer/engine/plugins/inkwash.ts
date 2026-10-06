import type { ImagePlugin, TransformContext, TransformationResult } from "../types";
import { toLuminance, smoothTone, xdog, valueNoise, writeResult } from "./ink-common";

const DEFAULT_INK: [number, number, number] = [30, 28, 26];
const DEFAULT_PAPER: [number, number, number] = [250, 247, 238];
const WASH_SIGMA = 2.2;
const LINE_SIGMA = 1.2;
const WASH_DENSITY = 0.85;
const LINE_DENSITY = 0.9;
const GRAIN_STRENGTH = 0.06;
const BLEED_FLOOR = 0.15;

export const InkWashPlugin: ImagePlugin = {
  id: "inkwash",
  name: "Ink Wash",
  category: "Creative",

  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const bands = Math.max(2, Math.round(ctx.inkwashBands ?? 5));
    const detail = Math.max(4, ctx.inkwashDetail ?? 16);
    const bleedAmount = Math.min(1, Math.max(0, ctx.inkwashBleed ?? 0.35));
    const ink = ctx.inkwashInk ?? DEFAULT_INK;
    const paper = ctx.inkwashPaper ?? DEFAULT_PAPER;

    const gray = toLuminance(data, width, height);
    const wash = smoothTone(gray, width, height, WASH_SIGMA, bands);
    const lines = xdog(gray, width, height, {
      sigma: LINE_SIGMA,
      k: 1.6,
      tau: 0.988,
      phi: detail,
      epsilon: -0.02,
    });

    const out = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        let density = (1 - wash[i]) * WASH_DENSITY;
        if (density > BLEED_FLOOR) {
          density += valueNoise(x, y, 0.15) * 0.35 * bleedAmount;
        }
        const lineDark = 1 - lines[i];
        const totalInk = Math.min(1, density + lineDark * LINE_DENSITY);
        const grain = (valueNoise(x, y, 0.5) - 0.5) * GRAIN_STRENGTH * 255;

        const p = i * 4;
        out[p] = paper[0] + (ink[0] - paper[0]) * totalInk + grain;
        out[p + 1] = paper[1] + (ink[1] - paper[1]) * totalInk + grain;
        out[p + 2] = paper[2] + (ink[2] - paper[2]) * totalInk + grain;
        out[p + 3] = 255;
      }
    }

    return writeResult(out);
  },
};

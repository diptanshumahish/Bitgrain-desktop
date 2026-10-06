import type { ImagePlugin, TransformContext, TransformationResult } from "../types";
import { toLuminance, smoothTone, xdog, valueNoise, writeResult } from "./ink-common";

const TONE_SIGMA = 1.6;
const LINE_SIGMA = 1.0;
const MIN_PHI = 8;
const MAX_PHI = 40;
const DEG_TO_RAD = Math.PI / 180;
const BASE_THICKNESS = 1.1;
const STROKE_GAP_CUTOFF = 0.08;
const LAYER_RAMP = 0.2;
const WOBBLE_FINE_FREQ = 0.09;
const WOBBLE_FINE_AMP = 2.0;
const WOBBLE_COARSE_FREQ = 0.022;
const WOBBLE_COARSE_AMP = 3.4;
const PRESSURE_FREQ = 0.3;
const PRESSURE_MIN = 0.5;
const PRESSURE_RANGE = 0.95;
const LAYER_SEED = 97;

// Layered crosshatch: each layer adds a set of parallel strokes at a fixed
// offset from the base angle, fading in once the pixel is dark enough. Darker
// tones accumulate more layers, and crossing layers multiply into denser ink,
// so midtones read as real hatching rather than bare paper.
const HATCH_LAYERS = [
  { offset: 0, gate: 0.10 },
  { offset: Math.PI / 2, gate: 0.26 },
  { offset: Math.PI / 4, gate: 0.44 },
  { offset: -Math.PI / 4, gate: 0.62 },
];

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const MangaPlugin: ImagePlugin = {
  id: "manga",
  name: "Manga",
  category: "Creative",

  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const spacing = Math.max(2, ctx.mangaCell ?? 2);
    const baseAngle = (ctx.mangaAngle ?? 45) * DEG_TO_RAD;
    const lineWeight = Math.min(1, Math.max(0, ctx.mangaLineWeight ?? 0.6));
    const contrast = Math.min(1, Math.max(0, ctx.mangaContrast ?? 0.5));

    const phi = MIN_PHI + (MAX_PHI - MIN_PHI) * lineWeight;
    const blackThreshold = lerp(0.06, 0.2, contrast);
    const gateScale = lerp(1.2, 0.65, contrast);

    const gray = toLuminance(data, width, height);
    const tone = smoothTone(gray, width, height, TONE_SIGMA, 0);
    const lines = xdog(gray, width, height, {
      sigma: LINE_SIGMA,
      k: 1.6,
      tau: 0.985,
      phi,
      epsilon: -0.03,
    });

    const cos = HATCH_LAYERS.map((layer) => Math.cos(baseAngle + layer.offset));
    const sin = HATCH_LAYERS.map((layer) => Math.sin(baseAngle + layer.offset));

    const out = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const darkness = 1 - tone[i];

        let remaining = 1;
        for (let layer = 0; layer < HATCH_LAYERS.length; layer++) {
          const gate = HATCH_LAYERS[layer].gate * gateScale;
          if (darkness < gate) continue;
          const strength = Math.min(1, (darkness - gate) / LAYER_RAMP);
          const c = cos[layer];
          const s = sin[layer];
          const seed = layer * LAYER_SEED;
          const wobble =
            (valueNoise(x + seed, y, WOBBLE_FINE_FREQ) - 0.5) * WOBBLE_FINE_AMP +
            (valueNoise(x, y + seed, WOBBLE_COARSE_FREQ) - 0.5) * WOBBLE_COARSE_AMP;
          const projected = x * c + y * s + wobble;
          const mod = ((projected % spacing) + spacing) % spacing;
          const dist = Math.min(mod, spacing - mod);
          const along = valueNoise(x * -s + y * c, seed, PRESSURE_FREQ);
          if (along < STROKE_GAP_CUTOFF) continue;
          const pressure = PRESSURE_MIN + PRESSURE_RANGE * along;
          const halfThickness = BASE_THICKNESS * (0.5 + 0.7 * strength) * pressure;
          if (dist < halfThickness) {
            const aa = Math.min(1, halfThickness - dist);
            remaining *= 1 - aa;
          }
        }

        let value = remaining;
        if (tone[i] < blackThreshold) value = 0;
        value = Math.min(value, lines[i]);

        const grayByte = value * 255;
        const p = i * 4;
        out[p] = grayByte;
        out[p + 1] = grayByte;
        out[p + 2] = grayByte;
        out[p + 3] = 255;
      }
    }

    return writeResult(out);
  },
};

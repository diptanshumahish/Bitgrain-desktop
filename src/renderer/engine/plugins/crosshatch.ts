import type {
  ImagePlugin,
  TransformContext,
  TransformationResult,
} from "../types";
import { inkForPaper } from "../tone/paper";
import { toLuminance } from "./ink-common";
import { measureLevels, stretchInPlace } from "../tone/auto-levels";

const LAYER_ANGLES_RAD = [
  Math.PI / 4,
  -Math.PI / 4,
  Math.PI / 2 + Math.PI / 8,
  -Math.PI / 8,
];
const DEFAULT_INK: [number, number, number] = [25, 22, 20];
const DEFAULT_PAPER: [number, number, number] = [245, 240, 228];
const HALF = 0.5;
const STROKE_SWELL = 0.2;
const LEVELS_CLIP = 0.01;
const LAYER_DARKNESS_GATE = [0.30, 0.50, 0.70, 0.85];

export const CrosshatchPlugin: ImagePlugin = {
  id: "crosshatch",
  name: "Crosshatch",
  category: "Creative",

  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const spacing = Math.max(3, Math.round(ctx.crosshatchSpacing ?? 7));
    const baseThickness = Math.max(1, ctx.crosshatchThickness ?? 1.4);
    const paperColor = ctx.crosshatchPaper ?? ctx.paperColor ?? DEFAULT_PAPER;
    const inkColor = ctx.crosshatchInk ?? (ctx.paperColor ? inkForPaper(ctx.paperColor) : DEFAULT_INK);

    const out = new Uint8ClampedArray(width * height * 4);
    const tone = toLuminance(data, width, height);
    stretchInPlace(tone, measureLevels(tone, LEVELS_CLIP), 1);

    const cosByLayer = LAYER_ANGLES_RAD.map(Math.cos);
    const sinByLayer = LAYER_ANGLES_RAD.map(Math.sin);

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const idx = (py * width + px) * 4;
        const darkness = 1 - tone[py * width + px];

        let inkAlpha = 0;
        for (let layer = 0; layer < LAYER_ANGLES_RAD.length; layer++) {
          if (darkness < LAYER_DARKNESS_GATE[layer]) continue;
          const layerStrength = Math.min(
            1,
            (darkness - LAYER_DARKNESS_GATE[layer]) /
              (1 - LAYER_DARKNESS_GATE[layer] + 0.001),
          );
          const projected = px * cosByLayer[layer] + py * sinByLayer[layer];
          const mod = ((projected % spacing) + spacing) % spacing;
          const dist = Math.min(mod, spacing - mod);
          const halfThickness = baseThickness * HALF + layerStrength * spacing * STROKE_SWELL;
          const aa = Math.min(1, Math.max(0, halfThickness - dist + HALF));
          inkAlpha = Math.max(inkAlpha, aa);
        }

        const r = paperColor[0] + (inkColor[0] - paperColor[0]) * inkAlpha;
        const g = paperColor[1] + (inkColor[1] - paperColor[1]) * inkAlpha;
        const b = paperColor[2] + (inkColor[2] - paperColor[2]) * inkAlpha;

        out[idx] = r;
        out[idx + 1] = g;
        out[idx + 2] = b;
        out[idx + 3] = 255;
      }
    }

    const workingData = new Float32Array(out.length);
    for (let i = 0; i < out.length; i++) workingData[i] = out[i];
    return { colorData: out, workingData };
  },
};

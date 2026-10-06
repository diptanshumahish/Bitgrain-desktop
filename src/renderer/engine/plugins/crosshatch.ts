import type {
  ImagePlugin,
  TransformContext,
  TransformationResult,
} from "../types";

const LAYER_ANGLES_RAD = [
  Math.PI / 4,
  -Math.PI / 4,
  Math.PI / 2 + Math.PI / 8,
  -Math.PI / 8,
];
const LAYER_DARKNESS_GATE = [0.30, 0.50, 0.70, 0.85];

function luminance(r: number, g: number, b: number): number {
  return (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
}

export const CrosshatchPlugin: ImagePlugin = {
  id: "crosshatch",
  name: "Crosshatch",
  category: "Creative",

  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const spacing = Math.max(3, Math.round(ctx.crosshatchSpacing ?? 7));
    const baseThickness = Math.max(1, ctx.crosshatchThickness ?? 1.4);
    const inkColor = ctx.crosshatchInk ?? [25, 22, 20];
    const paperColor = ctx.crosshatchPaper ?? [245, 240, 228];

    const out = new Uint8ClampedArray(width * height * 4);

    const cosByLayer = LAYER_ANGLES_RAD.map(Math.cos);
    const sinByLayer = LAYER_ANGLES_RAD.map(Math.sin);

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const idx = (py * width + px) * 4;
        const luma = luminance(data[idx], data[idx + 1], data[idx + 2]);
        const darkness = 1 - luma;

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
          const halfThickness = baseThickness * (0.5 + 0.5 * layerStrength);
          if (dist < halfThickness) {
            const aa = Math.min(1, halfThickness - dist);
            inkAlpha = Math.max(inkAlpha, aa * (0.5 + 0.5 * layerStrength));
          }
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

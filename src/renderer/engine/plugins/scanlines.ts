import type {
  ImagePlugin,
  TransformContext,
  TransformationResult,
} from "../types";

function clampInt(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function sampleChannel(
  data: Float32Array,
  width: number,
  height: number,
  x: number,
  y: number,
  channelOffset: number,
): number {
  const cx = clampInt(Math.round(x), 0, width - 1);
  const cy = clampInt(Math.round(y), 0, height - 1);
  return data[(cy * width + cx) * 4 + channelOffset];
}

export const ScanlinesPlugin: ImagePlugin = {
  id: "scanlines",
  name: "Scanlines",
  category: "Textures",

  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width, height } = ctx;
    const spacing = Math.max(2, Math.round(ctx.scanlineSpacing ?? 4));
    const intensity = Math.min(1, Math.max(0, ctx.scanlineIntensity ?? 0.4));
    const rgbShift = Math.max(0, ctx.scanlineRgbShift ?? 2);
    const curvature = Math.min(1, Math.max(0, ctx.scanlineCurvature ?? 0.0));

    const out = new Uint8ClampedArray(width * height * 4);
    const halfW = width / 2;
    const halfH = height / 2;

    for (let py = 0; py < height; py++) {
      const lineMod = py % spacing;
      const onLine = lineMod === 0;

      for (let px = 0; px < width; px++) {
        const dx = px - halfW;
        const dy = py - halfH;
        const radial = Math.sqrt(dx * dx + dy * dy) / Math.max(halfW, halfH);

        const r = sampleChannel(data, width, height, px + rgbShift, py, 0);
        const g = sampleChannel(data, width, height, px, py, 1);
        const b = sampleChannel(data, width, height, px - rgbShift, py, 2);

        let lineFactor = 1;
        if (onLine) lineFactor -= intensity;

        let vignette = 1;
        if (curvature > 0) {
          vignette = 1 - Math.min(1, radial * radial) * curvature;
        }

        const factor = lineFactor * vignette;
        const idx = (py * width + px) * 4;
        out[idx] = r * factor;
        out[idx + 1] = g * factor;
        out[idx + 2] = b * factor;
        out[idx + 3] = 255;
      }
    }

    const workingData = new Float32Array(out.length);
    for (let i = 0; i < out.length; i++) workingData[i] = out[i];
    return { colorData: out, workingData };
  },
};

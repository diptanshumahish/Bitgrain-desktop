import type {
  ImagePlugin,
  TransformContext,
  TransformationResult,
} from "../types";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

const SHARPNESS_DEFAULT = 60;
const SOFT_MAX_FEATHER = 2.0;
const SOFT_MIN_FEATHER = 0.02;
const MIN_FEATHER = 0.04;
const REFERENCE_CELL = 8;

const CMYK_ANGLES = [15, 75, 0, 45];
const CMYK_INKS: [number, number, number][] = [
  [0, 255, 255],
  [255, 0, 255],
  [255, 255, 0],
  [0, 0, 0],
];
const CMYK_MIN_CELL = 3;
const CMYK_K_STRENGTH = 0.9;
const CMYK_CMY_BOOST = 1.15;

function sampleBilinear(
  data: Float32Array,
  w: number,
  h: number,
  fx: number,
  fy: number,
  out: [number, number, number],
): void {
  if (isNaN(fx) || isNaN(fy)) {
    out[0] = 0; out[1] = 0; out[2] = 0;
    return;
  }
  const x0 = Math.floor(clamp(fx, 0, w - 1));
  const y0 = Math.floor(clamp(fy, 0, h - 1));
  const x1 = Math.min(x0 + 1, w - 1);
  const y1 = Math.min(y0 + 1, h - 1);
  const tx = fx - x0;
  const ty = fy - y0;

  const i00 = (y0 * w + x0) * 4;
  const i10 = (y0 * w + x1) * 4;
  const i01 = (y1 * w + x0) * 4;
  const i11 = (y1 * w + x1) * 4;

  if (i11 + 3 >= data.length) {
    out[0] = 0; out[1] = 0; out[2] = 0;
    return;
  }

  out[0] = lerp(lerp(data[i00], data[i10], tx), lerp(data[i01], data[i11], tx), ty) || 0;
  out[1] = lerp(lerp(data[i00+1], data[i10+1], tx), lerp(data[i01+1], data[i11+1], tx), ty) || 0;
  out[2] = lerp(lerp(data[i00+2], data[i10+2], tx), lerp(data[i01+2], data[i11+2], tx), ty) || 0;
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  const rN = r / 255; const gN = g / 255; const bN = b / 255;
  const k = 1 - Math.max(rN, gN, bN);
  if (k >= 1) return [0, 0, 0, 1];
  const c = (1 - rN - k) / (1 - k);
  const m = (1 - gN - k) / (1 - k);
  const y = (1 - bN - k) / (1 - k);
  return [c, m, y, k];
}

function dotDistance(offX: number, offY: number, isSquare: boolean): number {
  return isSquare
    ? Math.max(Math.abs(offX), Math.abs(offY))
    : Math.sqrt(offX * offX + offY * offY);
}

export const HalftonePlugin: ImagePlugin = {
  id: "halftone",
  name: "Halftone",
  category: "Textures",

  transform: (ctx: TransformContext): TransformationResult => {
    const { data, width: srcW, height: srcH } = ctx;
    const cellPx = Math.max(1, ctx.halftoneCell ?? 2);
    const baseAngle = ctx.halftoneAngle ?? 45;
    const frameSeed = (ctx.halftoneFrameSeed ?? 0) | 0;
    const angleWobble = frameSeed === 0 ? 0 : Math.sin(frameSeed * 0.37) * 0.15;
    const style = ctx.halftoneStyle ?? "mono";
    const isSquare = (ctx.halftoneShape ?? "round") === "square";
    const invertDot = ctx.halftoneInvert !== undefined ? ctx.halftoneInvert : true;
    const intensity = ctx.halftoneIntensity ?? 1;
    const sharpness = clamp(ctx.halftoneSharpness ?? SHARPNESS_DEFAULT, 0, 100);
    const baseFeather = SOFT_MAX_FEATHER + (SOFT_MIN_FEATHER - SOFT_MAX_FEATHER) * (sharpness / 100);
    const feather = Math.max(MIN_FEATHER, baseFeather * (cellPx / REFERENCE_CELL));

    const outW = srcW;
    const outH = srcH;
    const bufLen = outW * outH * 4;
    const colorData = new Uint8ClampedArray(bufLen);
    const halfCell = cellPx * 0.5;
    const midX = outW / 2;
    const midY = outH / 2;
    const sample: [number, number, number] = [0, 0, 0];

    if (style === "cmyk") {
      const cmykCell = Math.max(CMYK_MIN_CELL, cellPx);
      const cmykHalfCell = cmykCell * 0.5;
      const cmykFeather = Math.max(MIN_FEATHER, baseFeather * (cmykCell / REFERENCE_CELL));
      const cosCh = CMYK_ANGLES.map((a) => Math.cos(((a + angleWobble) * Math.PI) / 180));
      const sinCh = CMYK_ANGLES.map((a) => Math.sin(((a + angleWobble) * Math.PI) / 180));

      for (let py = 0; py < outH; py++) {
        for (let px = 0; px < outW; px++) {
          const dx0 = px - midX;
          const dy0 = py - midY;
          let r = 255;
          let g = 255;
          let b = 255;

          for (let channel = 0; channel < 4; channel++) {
            const cosA = cosCh[channel];
            const sinA = sinCh[channel];
            const rx = dx0 * cosA + dy0 * sinA;
            const ry = -dx0 * sinA + dy0 * cosA;
            const cx = Math.round(rx / cmykCell) * cmykCell;
            const cy = Math.round(ry / cmykCell) * cmykCell;
            sampleBilinear(data, srcW, srcH, cx * cosA - cy * sinA + midX, cx * sinA + cy * cosA + midY, sample);
            const cmyk = rgbToCmyk(sample[0], sample[1], sample[2]);
            const gain = channel === 3 ? CMYK_K_STRENGTH : CMYK_CMY_BOOST;
            const density = clamp(cmyk[channel] * intensity * gain, 0, 1);
            const dotRadius = cmykHalfCell * density;
            const cov = clamp(1 - (dotDistance(rx - cx, ry - cy, isSquare) - dotRadius) / cmykFeather, 0, 1);
            if (cov > 0) {
              const ink = CMYK_INKS[channel];
              r = lerp(r, (r * ink[0]) / 255, cov);
              g = lerp(g, (g * ink[1]) / 255, cov);
              b = lerp(b, (b * ink[2]) / 255, cov);
            }
          }

          const idx = (py * outW + px) * 4;
          colorData[idx] = r;
          colorData[idx + 1] = g;
          colorData[idx + 2] = b;
          colorData[idx + 3] = 255;
        }
      }
    } else {
      const angleRad = ((baseAngle + angleWobble) * Math.PI) / 180;
      const cosA = Math.cos(angleRad);
      const sinA = Math.sin(angleRad);
      const bg: [number, number, number] = invertDot ? [255, 255, 255] : [0, 0, 0];
      const fg: [number, number, number] = invertDot ? [0, 0, 0] : [255, 255, 255];

      for (let py = 0; py < outH; py++) {
        for (let px = 0; px < outW; px++) {
          const dx0 = px - midX;
          const dy0 = py - midY;
          const rx = dx0 * cosA + dy0 * sinA;
          const ry = -dx0 * sinA + dy0 * cosA;
          const cx = Math.round(rx / cellPx) * cellPx;
          const cy = Math.round(ry / cellPx) * cellPx;
          sampleBilinear(data, srcW, srcH, cx * cosA - cy * sinA + midX, cx * sinA + cy * cosA + midY, sample);

          const luma = (sample[0] * 0.2126 + sample[1] * 0.7152 + sample[2] * 0.0722) / 255;
          const density = clamp(luma * intensity, 0, 1);
          const dotR = style === "color" ? sample : fg;
          const dotRadius = halfCell * (invertDot ? 1 - density : density);
          const alpha = clamp(1 - (dotDistance(rx - cx, ry - cy, isSquare) - dotRadius) / feather, 0, 1);
          const idx = (py * outW + px) * 4;

          if (alpha > 0) {
            colorData[idx] = lerp(bg[0], dotR[0], alpha);
            colorData[idx + 1] = lerp(bg[1], dotR[1], alpha);
            colorData[idx + 2] = lerp(bg[2], dotR[2], alpha);
          } else {
            colorData[idx] = bg[0];
            colorData[idx + 1] = bg[1];
            colorData[idx + 2] = bg[2];
          }
          colorData[idx + 3] = 255;
        }
      }
    }

    const workingData = new Float32Array(bufLen);
    for (let i = 0; i < bufLen; i++) workingData[i] = colorData[i];

    return { colorData, workingData };
  },
};

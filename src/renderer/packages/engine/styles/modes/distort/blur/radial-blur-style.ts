import type { FrameStyleDefinition, SourceImage } from "../../../engine/style-definition";
import type { ParamValues } from "../../../engine/style-types";
import { numberParam, textParam } from "../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../finish/frame-tone";
import { clampIndex } from "../../../postfx/pixel-ops";

const PERCENT = 100;
const CHANNELS = 4;
const ZOOM_SPREAD = 0.5;
const SPIN_SPREAD = 0.6;
const MIN_TAPS = 14;
const MAX_TAPS = 40;
const PIXELS_PER_TAP = 2;
const HALF = 0.5;

const KEYS = { method: "method", amount: "amount", centreX: "x", centreY: "y" } as const;

interface RadialTaps {
  centreX: number;
  centreY: number;
  scaleCos: Float32Array;
  scaleSin: Float32Array;
}

const tapsFor = (params: ParamValues, width: number, height: number): RadialTaps => {
  const amount = numberParam(params, KEYS.amount) / PERCENT;
  const spin = textParam(params, KEYS.method) === "spin";
  const spread = amount * (spin ? SPIN_SPREAD : ZOOM_SPREAD);
  const count = Math.min(MAX_TAPS, Math.max(MIN_TAPS, Math.ceil((Math.hypot(width, height) * HALF * spread) / PIXELS_PER_TAP)));
  const scaleCos = new Float32Array(count);
  const scaleSin = new Float32Array(count);
  for (let tap = 0; tap < count; tap++) {
    const offset = tap / (count - 1) - HALF;
    scaleCos[tap] = spin ? Math.cos(spread * offset) : 1 - spread * offset;
    scaleSin[tap] = spin ? Math.sin(spread * offset) : 0;
  }
  return { centreX: (numberParam(params, KEYS.centreX) / PERCENT) * width, centreY: (numberParam(params, KEYS.centreY) / PERCENT) * height, scaleCos, scaleSin };
};

const averageTaps = (source: SourceImage, taps: RadialTaps, x: number, y: number, target: Uint8ClampedArray): void => {
  const { data, width, height } = source;
  const offsetX = x - taps.centreX;
  const offsetY = y - taps.centreY;
  let red = 0, green = 0, blue = 0, alpha = 0;
  for (let tap = 0; tap < taps.scaleCos.length; tap++) {
    const sampleX = Math.round(taps.centreX + offsetX * taps.scaleCos[tap] - offsetY * taps.scaleSin[tap]);
    const sampleY = Math.round(taps.centreY + offsetX * taps.scaleSin[tap] + offsetY * taps.scaleCos[tap]);
    const index = (clampIndex(sampleY, height) * width + clampIndex(sampleX, width)) * CHANNELS;
    red += data[index]; green += data[index + 1]; blue += data[index + 2]; alpha += data[index + 3];
  }
  const count = taps.scaleCos.length;
  const targetIndex = (y * width + x) * CHANNELS;
  target[targetIndex] = red / count; target[targetIndex + 1] = green / count;
  target[targetIndex + 2] = blue / count; target[targetIndex + 3] = alpha / count;
};

export const RADIAL_BLUR_STYLE: FrameStyleDefinition = {
  id: "radialblur",
  label: "Radial blur",
  hint: "Rush toward the centre, or spin around it",
  glyph: "✺",
  category: "blur",
  kind: "frame",
  params: [
    { kind: "select", key: KEYS.method, label: "Method", options: [{ value: "zoom", label: "Zoom" }, { value: "spin", label: "Spin" }], default: "zoom" },
    { kind: "number", key: KEYS.amount, label: "Amount", min: 0, max: 100, step: 1, default: 40, suffix: "%" },
    { kind: "number", key: KEYS.centreX, label: "Centre across", min: 0, max: 100, step: 1, default: 50, suffix: "%", advanced: true },
    { kind: "number", key: KEYS.centreY, label: "Centre down", min: 0, max: 100, step: 1, default: 50, suffix: "%", advanced: true },
    ...frameToneParams(),
  ],
  renderFrame: ({ frame, source, params }) => {
    const toned = toneAdjustedSource(source, params);
    const taps = tapsFor(params, source.width, source.height);
    const target = frame.pixels().data;
    for (let y = 0; y < source.height; y++) {
      for (let x = 0; x < source.width; x++) averageTaps(toned, taps, x, y, target);
    }
    frame.commit();
  },
};

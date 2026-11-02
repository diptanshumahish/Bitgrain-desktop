import { numberParam } from "../../engine/resolve-params";
import { percentParam, pixelParam, type EffectDefinition, type EffectInput } from "../effect-definition";
import { clampIndex, copyPixels } from "../pixel-ops";

const PERCENT = 100;
const CHANNELS = 4;
const CRT_STRENGTH = 0.3;
const SLICE_BASE = 3;
const SLICE_GAIN = 15;
const SHIFT_SHARE = 0.1;
const MIN_SLICE = 2;
const RGB_GAIN = 0.14;

const applyCrtCurve = ({ frame, values }: EffectInput): void => {
  const strength = (CRT_STRENGTH * numberParam(values, "amount")) / PERCENT;
  if (strength <= 0) return;
  const { width, height } = frame;
  const data = frame.pixels().data;
  const source = copyPixels(data);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = (x - halfWidth) / halfWidth;
      const v = (y - halfHeight) / halfHeight;
      const factor = 1 + (u * u + v * v) * strength;
      const sourceX = Math.round(u * factor * halfWidth + halfWidth);
      const sourceY = Math.round(v * factor * halfHeight + halfHeight);
      const index = (y * width + x) * CHANNELS;
      const inside = sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height;
      const from = inside ? (sourceY * width + sourceX) * CHANNELS : -1;
      for (let channel = 0; channel < CHANNELS; channel++) data[index + channel] = from < 0 ? (channel === 3 ? 255 : 0) : source[from + channel];
    }
  }
};

export const CRT_CURVE_EFFECT: EffectDefinition = {
  key: "crtCurve",
  label: "CRT curve",
  hint: "Bulge the frame like a tube screen",
  params: [percentParam("amount", "Curve", 30)],
  apply: applyCrtCurve,
};

const shiftRow = (data: Uint8ClampedArray, snapshot: Uint8ClampedArray, width: number, row: number, shift: number): void => {
  for (let x = 0; x < width; x++) {
    const sourceX = x - shift;
    if (sourceX < 0 || sourceX >= width) continue;
    const to = (row * width + x) * CHANNELS;
    const from = (row * width + sourceX) * CHANNELS;
    for (let channel = 0; channel < CHANNELS; channel++) data[to + channel] = snapshot[from + channel];
  }
};

const splitRows = (data: Uint8ClampedArray, width: number, offset: number): void => {
  const snapshot = copyPixels(data);
  for (let index = 0; index < data.length; index += CHANNELS) {
    const pixel = index / CHANNELS;
    const x = pixel % width;
    const rowStart = pixel - x;
    data[index] = snapshot[(rowStart + clampIndex(x - offset, width)) * CHANNELS];
    data[index + 2] = snapshot[(rowStart + clampIndex(x + offset, width)) * CHANNELS + 2];
  }
};

const applyGlitch = ({ frame, values, scale, random }: EffectInput): void => {
  const intensity = numberParam(values, "amount") / PERCENT;
  const { width, height } = frame;
  const data = frame.pixels().data;
  const snapshot = copyPixels(data);
  const maxShift = Math.floor(intensity * width * SHIFT_SHARE);
  const slices = Math.floor(SLICE_BASE + SLICE_GAIN * intensity);
  for (let slice = 0; slice < slices; slice++) {
    const top = Math.floor(random() * height);
    const sliceHeight = Math.floor(MIN_SLICE * scale + random() * Math.max(MIN_SLICE, numberParam(values, "slice")));
    const shift = Math.floor((random() - 0.5) * 2 * maxShift);
    if (shift === 0) continue;
    for (let row = top; row < Math.min(height, top + sliceHeight); row++) shiftRow(data, snapshot, width, row, shift);
  }
  const rgb = numberParam(values, "rgb");
  if (rgb > 0) splitRows(data, width, Math.round(RGB_GAIN * rgb * scale) + 1);
};

export const GLITCH_EFFECT: EffectDefinition = {
  key: "glitch",
  label: "Glitch",
  hint: "Torn bands that slide sideways",
  params: [
    percentParam("amount", "Amount", 20),
    pixelParam("slice", "Slice size", 2, 80, 20, true),
    percentParam("rgb", "Colour tear", 0, true),
  ],
  apply: applyGlitch,
};

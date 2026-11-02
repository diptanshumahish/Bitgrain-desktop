import type { RgbTriple } from "../../../postfx/pixel-ops";
import { softCopy, type SoftCopy } from "../../../finish/soft-copy";
import { lumaOfRgb } from "../shared/light-maths";
import { stretched, type ToneStretch } from "./dust-field";

const BYTE = 255;
const RGBA = 4;
const SATURATION_PUSH = 1.4;
const MONO_BASE = 40;
const MONO_GAIN = 215;

type Painter = (red: number, green: number, blue: number, level: number, out: Uint8ClampedArray, index: number) => void;

const paintSource: Painter = (red, green, blue, level, out, index) => {
  const luma = lumaOfRgb(red, green, blue);
  const target = level * BYTE;
  out[index] = (red - luma) * SATURATION_PUSH + target;
  out[index + 1] = (green - luma) * SATURATION_PUSH + target;
  out[index + 2] = (blue - luma) * SATURATION_PUSH + target;
};

const paintMono: Painter = (_red, _green, _blue, level, out, index) => {
  const grey = MONO_BASE + MONO_GAIN * level;
  out[index] = grey;
  out[index + 1] = grey;
  out[index + 2] = grey;
};

const rampPainter = (ramp: readonly RgbTriple[]): Painter => (_red, _green, _blue, level, out, index) => {
  const upper = level >= 0.5;
  const from = upper ? ramp[1] : ramp[0];
  const to = upper ? ramp[2] : ramp[1];
  const blend = upper ? (level - 0.5) * 2 : level * 2;
  for (let channel = 0; channel < 3; channel++) out[index + channel] = from[channel] + (to[channel] - from[channel]) * blend;
};

export const dustColourLayer = (
  canvas: OffscreenCanvas, sigma: number, stretch: ToneStretch, ramp: readonly RgbTriple[] | null, mono: boolean,
): SoftCopy => {
  const copy = softCopy(canvas, canvas.width, canvas.height, sigma);
  const context = copy.canvas.getContext("2d");
  if (!context) return copy;
  const image = context.getImageData(0, 0, copy.width, copy.height);
  const data = image.data;
  const paint = ramp ? rampPainter(ramp) : mono ? paintMono : paintSource;
  for (let index = 0; index < data.length; index += RGBA) {
    const level = stretched(stretch, lumaOfRgb(data[index], data[index + 1], data[index + 2]) / BYTE);
    paint(data[index], data[index + 1], data[index + 2], level, data, index);
  }
  context.putImageData(image, 0, 0);
  return copy;
};

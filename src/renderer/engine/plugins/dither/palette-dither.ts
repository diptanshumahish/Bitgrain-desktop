import type { DitherMethod, Palette } from "../../types";
import { srgbByteToLinear } from "../../tone/srgb-linear";
import { kernelFor } from "./diffusion-kernels";
import { isOrderedMethod, thresholdSourceFor } from "./threshold-source";
import { nearestPaletteIndex, preparePalette, type PreparedPalette } from "./palette-space";

const RGBA_STRIDE = 4;
const RGB_STRIDE = 3;
const ERROR_HEADROOM = 0.35;
const ORDERED_STRENGTH = 0.8;
const BYTE_MAX = 255;

export interface PaletteDitherJob {
  data: Float32Array;
  width: number;
  height: number;
  method: DitherMethod;
  errorGain: number;
  seed: number;
  palette: Palette;
}

const toLinearRgb = (data: Float32Array, pixelCount: number): Float32Array => {
  const linear = new Float32Array(pixelCount * RGB_STRIDE);
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    for (let axis = 0; axis < RGB_STRIDE; axis++) {
      linear[pixel * RGB_STRIDE + axis] = srgbByteToLinear(data[pixel * RGBA_STRIDE + axis]);
    }
  }
  return linear;
};

const writeSwatch = (out: Float32Array, pixel: number, prepared: PreparedPalette, index: number): void => {
  const swatch = prepared.srgb[index];
  out[pixel * RGBA_STRIDE] = swatch[0];
  out[pixel * RGBA_STRIDE + 1] = swatch[1];
  out[pixel * RGBA_STRIDE + 2] = swatch[2];
  out[pixel * RGBA_STRIDE + 3] = 255;
};

const shiftedLinear = (byteValue: number, offset: number): number => srgbByteToLinear(byteValue + offset * BYTE_MAX);

const orderedPalette = (job: PaletteDitherJob, prepared: PreparedPalette, out: Float32Array): void => {
  const thresholdAt = thresholdSourceFor(job.method, job.seed);
  const strength = prepared.srgbSpread * ORDERED_STRENGTH * job.errorGain;
  for (let y = 0; y < job.height; y++) {
    for (let x = 0; x < job.width; x++) {
      const pixel = y * job.width + x;
      const offset = (thresholdAt(x, y) - 0.5) * strength;
      const base = pixel * RGBA_STRIDE;
      const index = nearestPaletteIndex(
        prepared,
        shiftedLinear(job.data[base], offset),
        shiftedLinear(job.data[base + 1], offset),
        shiftedLinear(job.data[base + 2], offset),
      );
      writeSwatch(out, pixel, prepared, index);
    }
  }
};

const clampWorking = (value: number): number =>
  value < -ERROR_HEADROOM ? -ERROR_HEADROOM : value > 1 + ERROR_HEADROOM ? 1 + ERROR_HEADROOM : value;

const diffusePalette = (job: PaletteDitherJob, prepared: PreparedPalette, linear: Float32Array, out: Float32Array): void => {
  const { width, height } = job;
  const kernel = kernelFor(job.method);
  const error = new Float32Array(RGB_STRIDE);
  for (let y = 0; y < height; y++) {
    const forward = (y & 1) === 0;
    const direction = forward ? 1 : -1;
    for (let step = 0; step < width; step++) {
      const x = forward ? step : width - 1 - step;
      const pixel = y * width + x;
      const base = pixel * RGB_STRIDE;
      for (let axis = 0; axis < RGB_STRIDE; axis++) linear[base + axis] = clampWorking(linear[base + axis]);
      const index = nearestPaletteIndex(prepared, linear[base], linear[base + 1], linear[base + 2]);
      writeSwatch(out, pixel, prepared, index);
      for (let axis = 0; axis < RGB_STRIDE; axis++) {
        error[axis] = (linear[base + axis] - prepared.linear[index * RGB_STRIDE + axis]) * job.errorGain;
      }
      for (const [dx, dy, weight] of kernel) {
        const targetX = x + dx * direction;
        const targetY = y + dy;
        if (targetX < 0 || targetX >= width || targetY >= height) continue;
        const target = (targetY * width + targetX) * RGB_STRIDE;
        linear[target] += error[0] * weight;
        linear[target + 1] += error[1] * weight;
        linear[target + 2] += error[2] * weight;
      }
    }
  }
};

export const ditherWithPalette = (job: PaletteDitherJob): Float32Array => {
  const pixelCount = job.width * job.height;
  const prepared = preparePalette(job.palette);
  const out = new Float32Array(pixelCount * RGBA_STRIDE);
  if (isOrderedMethod(job.method)) orderedPalette(job, prepared, out);
  else diffusePalette(job, prepared, toLinearRgb(job.data, pixelCount), out);
  return out;
};

import type { DitherMethod, Palette } from "../../../core/types";
import { srgbByteToLinear } from "../../../tone/srgb-linear";
import { isOrderedMethod, thresholdSourceFor } from "../threshold-source";
import { preparePalette, type PreparedPalette } from "./palette-space";
import { createPaletteMatcher, matchPaletteIndex, type PaletteMatcher } from "./palette-matcher";
import { diffusePalette } from "./palette-diffusion";

const RGBA_STRIDE = 4;
const RGB_STRIDE = 3;
const ORDERED_STRENGTH = 0.8;
const BYTE_MAX = 255;
const ALPHA_OPAQUE = 255;
const THRESHOLD_CENTRE = 0.5;

interface PaletteDitherJob {
  data: Float32Array;
  width: number;
  height: number;
  method: DitherMethod;
  errorGain: number;
  seed: number;
  palette: Palette;
}

const writeSwatch = (out: Float32Array, pixel: number, prepared: PreparedPalette, index: number): void => {
  const swatch = index * RGB_STRIDE;
  out[pixel * RGBA_STRIDE] = prepared.swatches[swatch];
  out[pixel * RGBA_STRIDE + 1] = prepared.swatches[swatch + 1];
  out[pixel * RGBA_STRIDE + 2] = prepared.swatches[swatch + 2];
  out[pixel * RGBA_STRIDE + 3] = ALPHA_OPAQUE;
};

const shiftedLinear = (byteValue: number, offset: number): number => srgbByteToLinear(byteValue + offset * BYTE_MAX);

const orderedPalette = (job: PaletteDitherJob, prepared: PreparedPalette, matcher: PaletteMatcher, out: Float32Array): void => {
  const thresholdAt = thresholdSourceFor(job.method, job.seed);
  const strength = prepared.srgbSpread * ORDERED_STRENGTH * job.errorGain;
  for (let y = 0; y < job.height; y++) {
    for (let x = 0; x < job.width; x++) {
      const pixel = y * job.width + x;
      const offset = (thresholdAt(x, y) - THRESHOLD_CENTRE) * strength;
      const base = pixel * RGBA_STRIDE;
      const index = matchPaletteIndex(
        matcher,
        shiftedLinear(job.data[base], offset),
        shiftedLinear(job.data[base + 1], offset),
        shiftedLinear(job.data[base + 2], offset),
      );
      writeSwatch(out, pixel, prepared, index);
    }
  }
};

export const ditherWithPalette = (job: PaletteDitherJob): Float32Array => {
  const pixelCount = job.width * job.height;
  const prepared = preparePalette(job.palette);
  const out = new Float32Array(pixelCount * RGBA_STRIDE);
  const matcher = createPaletteMatcher(prepared, job.palette);
  if (isOrderedMethod(job.method)) orderedPalette(job, prepared, matcher, out);
  else diffusePalette({ ...job, out, prepared, matcher });
  return out;
};

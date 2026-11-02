import { CHANNEL_MAX } from "../shared/screen-math";
import {
  RGB_STRIDE, lumaAtPixel, nearestLumaEntry, nearestPaletteIndex, paletteLumas,
  writeOriginalTone, writePaletteColour, writeRgb, type DitherJob,
} from "./dither-job";

const MID = 128;

interface OrderedPass {
  job: DitherJob;
  spread: number;
  lumas: Float32Array;
}

const thresholdAt = (job: DitherJob, pattern: number): number =>
  Math.min(CHANNEL_MAX, Math.max(0, (pattern - MID) * job.strength + MID - job.bias));

const luminancePixel = (pass: OrderedPass, pixel: number, threshold: number): void => {
  const luma = lumaAtPixel(pass.job.rgb, pixel);
  if (pass.job.original) {
    writeOriginalTone(pass.job, pixel, luma > threshold ? CHANNEL_MAX : 0, luma);
    return;
  }
  const entry = nearestLumaEntry(pass.lumas, luma + (MID - threshold) * pass.spread);
  writePaletteColour(pass.job, pixel, entry * RGB_STRIDE);
};

const bitOf = (value: number, threshold: number): number => (value > threshold ? CHANNEL_MAX : 0);

const perChannelPixel = (job: DitherJob, pixel: number, threshold: number): void => {
  const offset = pixel * RGB_STRIDE;
  writeRgb(job.output, pixel, bitOf(job.rgb[offset], threshold), bitOf(job.rgb[offset + 1], threshold), bitOf(job.rgb[offset + 2], threshold));
};

const standardPixel = (pass: OrderedPass, pixel: number, threshold: number): void => {
  const { job } = pass;
  const offset = pixel * RGB_STRIDE;
  const shift = (MID - threshold) * pass.spread;
  const entry = nearestPaletteIndex(job.palette, job.rgb[offset] + shift, job.rgb[offset + 1] + shift, job.rgb[offset + 2] + shift);
  writePaletteColour(job, pixel, entry);
};

export const ditherOrdered = (job: DitherJob, pattern: Float32Array): void => {
  const colours = job.palette.length / RGB_STRIDE;
  const pass: OrderedPass = { job, spread: 1 / Math.sqrt(Math.max(1, colours - 1)), lumas: paletteLumas(job.palette) };
  const luminance = job.original || job.chroma === "luminance";
  for (let pixel = 0; pixel < job.width * job.height; pixel++) {
    const threshold = thresholdAt(job, pattern[pixel]);
    if (luminance) luminancePixel(pass, pixel, threshold);
    else if (job.chroma === "perChannel") perChannelPixel(job, pixel, threshold);
    else standardPixel(pass, pixel, threshold);
  }
};

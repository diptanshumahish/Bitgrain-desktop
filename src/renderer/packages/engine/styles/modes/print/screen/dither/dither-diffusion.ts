import type { SelectOption } from "../../../../engine/style-types";
import type { DitherMethod } from "../../../../../core/types";
import { kernelFor, type DiffusionTap } from "../../../../../plugins/dither/diffusion-kernels";
import { CHANNEL_MAX } from "../shared/screen-math";
import {
  RGB_STRIDE, lumaAtPixel, nearestLumaEntry, nearestPaletteIndex, paletteLumas,
  writeOriginalTone, writePaletteColour, writeRgb, type DitherJob,
} from "./dither-job";

const MID = 128;

export const DIFFUSION_OPTIONS: readonly SelectOption[] = [
  { value: "floyd", label: "Floyd-Steinberg" },
  { value: "atkinson", label: "Atkinson" },
  { value: "stucki", label: "Stucki" },
  { value: "sierraLite", label: "Sierra Lite" },
];

const KERNEL_METHODS: Readonly<Record<string, DitherMethod>> = {
  floyd: "floyd-steinberg", atkinson: "atkinson", stucki: "stucki", sierraLite: "sierra-lite",
};

export const isDiffusionAlgorithm = (algorithm: string): boolean => algorithm in KERNEL_METHODS;

interface DiffusionPass {
  job: DitherJob;
  planes: Float32Array[];
  taps: DiffusionTap[];
  lumas: Float32Array;
}

const spreadError = (pass: DiffusionPass, plane: Float32Array, x: number, y: number, direction: number, error: number): void => {
  const { width, height } = pass.job;
  for (const [deltaX, deltaY, weight] of pass.taps) {
    const targetX = x + deltaX * direction;
    const targetY = y + deltaY;
    if (targetX < 0 || targetX >= width || targetY >= height) continue;
    plane[targetY * width + targetX] += error * weight;
  }
};

const luminanceStep = (pass: DiffusionPass, x: number, y: number, direction: number): void => {
  const { job } = pass;
  const pixel = y * job.width + x;
  const luma = pass.planes[0][pixel];
  const entry = job.original ? 0 : nearestLumaEntry(pass.lumas, luma);
  const level = job.original ? (luma < MID ? 0 : CHANNEL_MAX) : pass.lumas[entry];
  if (job.original) writeOriginalTone(job, pixel, level, lumaAtPixel(job.rgb, pixel));
  else writePaletteColour(job, pixel, entry * RGB_STRIDE);
  spreadError(pass, pass.planes[0], x, y, direction, (luma - level) * job.strength);
};

const bitLevel = (value: number): number => (value < MID ? 0 : CHANNEL_MAX);

const perChannelStep = (pass: DiffusionPass, x: number, y: number, direction: number): void => {
  const { job, planes } = pass;
  const pixel = y * job.width + x;
  writeRgb(job.output, pixel, bitLevel(planes[0][pixel]), bitLevel(planes[1][pixel]), bitLevel(planes[2][pixel]));
  for (let channel = 0; channel < RGB_STRIDE; channel++) {
    const value = planes[channel][pixel];
    spreadError(pass, planes[channel], x, y, direction, (value - bitLevel(value)) * job.strength);
  }
};

const standardStep = (pass: DiffusionPass, x: number, y: number, direction: number): void => {
  const { job, planes } = pass;
  const pixel = y * job.width + x;
  const entry = nearestPaletteIndex(job.palette, planes[0][pixel], planes[1][pixel], planes[2][pixel]);
  writePaletteColour(job, pixel, entry);
  for (let channel = 0; channel < RGB_STRIDE; channel++) {
    const error = (planes[channel][pixel] - job.palette[entry + channel]) * job.strength;
    spreadError(pass, planes[channel], x, y, direction, error);
  }
};

const buildPlanes = (job: DitherJob, luminance: boolean): Float32Array[] => {
  const count = job.width * job.height;
  const planes = Array.from({ length: luminance ? 1 : RGB_STRIDE }, () => new Float32Array(count));
  for (let pixel = 0; pixel < count; pixel++) {
    if (luminance) planes[0][pixel] = lumaAtPixel(job.rgb, pixel) + job.bias;
    else for (let channel = 0; channel < RGB_STRIDE; channel++) planes[channel][pixel] = job.rgb[pixel * RGB_STRIDE + channel] + job.bias;
  }
  return planes;
};

type DiffusionStep = (pass: DiffusionPass, x: number, y: number, direction: number) => void;

const stepFor = (job: DitherJob): DiffusionStep => {
  if (job.original || job.chroma === "luminance") return luminanceStep;
  return job.chroma === "perChannel" ? perChannelStep : standardStep;
};

export const ditherDiffusion = (job: DitherJob, algorithm: string): void => {
  const step = stepFor(job);
  const pass: DiffusionPass = { job, planes: buildPlanes(job, step === luminanceStep), taps: kernelFor(KERNEL_METHODS[algorithm]), lumas: paletteLumas(job.palette) };
  for (let y = 0; y < job.height; y++) {
    const direction = y % 2 === 0 ? 1 : -1;
    for (let column = 0; column < job.width; column++) step(pass, direction > 0 ? column : job.width - 1 - column, y, direction);
  }
};

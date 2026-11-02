import { mix, smoothRange } from "../shared/screen-math";
import { latticeHash, valueNoise } from "../shared/value-noise";
import type { DropJob } from "./cmyk-render";

export interface GrainSample {
  shrink: number;
  overlay: number;
}

const SHRINK_SEED = 3;
const OVERLAY_SEED_A = 5;
const OVERLAY_SEED_B = 9;
const SHRINK_START = 0.55;
const OVERLAY_POWER = 1.3;
const OVERLAY_SHAPE = 0.8;
const OVERLAY_GAIN = 0.5;

const grainNoise = (job: DropJob, x: number, y: number, seed: number): number => {
  const cellsPerPixel = job.settings.grainFrequency / job.frame.height;
  if (cellsPerPixel >= 1) return latticeHash(x, y, seed);
  return valueNoise(x * cellsPerPixel, y * cellsPerPixel, seed);
};

export const grainAt = (job: DropJob, x: number, y: number, grain: GrainSample): void => {
  const { settings } = job;
  grain.shrink = settings.grainMixer > 0 ? smoothRange(SHRINK_START, 1, grainNoise(job, x, y, SHRINK_SEED)) * settings.grainMixer : 0;
  grain.overlay = 0;
  if (settings.overlay <= 0) return;
  const blended = (grainNoise(job, x, y, OVERLAY_SEED_A) + grainNoise(job, x, y, OVERLAY_SEED_B)) / 2;
  const signed = Math.pow(blended, OVERLAY_POWER) * 2 - 1;
  grain.overlay = Math.sign(signed) * OVERLAY_GAIN * Math.pow(settings.overlay * Math.abs(signed), OVERLAY_SHAPE);
};

export const overlayPixel = (value: number, grain: GrainSample): number =>
  grain.overlay >= 0 ? mix(value, 1, grain.overlay) : mix(value, 0, -grain.overlay);

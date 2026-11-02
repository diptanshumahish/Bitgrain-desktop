import type { DitherMethod } from "../../core/types";
import { flattenKernel } from "./diffusion-kernels";
import { BLUE_NOISE_SIZE, blueNoiseMask } from "./blue-noise-mask";
import { isOrderedMethod, thresholdSourceFor } from "./threshold-source";

const WORM_BREAK_JITTER = 0.12;
const ERROR_HEADROOM = 0.6;

interface MonoDitherJob {
  tone: Float32Array;
  width: number;
  height: number;
  method: DitherMethod;
  errorGain: number;
  seed: number;
}

const orderedMono = (job: MonoDitherJob, ink: Uint8Array): void => {
  const thresholdAt = thresholdSourceFor(job.method, job.seed);
  for (let y = 0; y < job.height; y++) {
    for (let x = 0; x < job.width; x++) {
      const pixel = y * job.width + x;
      ink[pixel] = job.tone[pixel] > thresholdAt(x, y) ? 0 : 1;
    }
  }
};

const clampWorking = (value: number): number =>
  value < -ERROR_HEADROOM ? -ERROR_HEADROOM : value > 1 + ERROR_HEADROOM ? 1 + ERROR_HEADROOM : value;

const diffuseMono = (job: MonoDitherJob, ink: Uint8Array): void => {
  const { width, height, errorGain } = job;
  const working = Float32Array.from(job.tone);
  const { offsetsX, offsetsY, weights } = flattenKernel(job.method);
  const tapCount = weights.length;
  const noise = blueNoiseMask();
  for (let y = 0; y < height; y++) {
    const forward = (y & 1) === 0;
    const direction = forward ? 1 : -1;
    const noiseRow = (y % BLUE_NOISE_SIZE) * BLUE_NOISE_SIZE;
    for (let step = 0; step < width; step++) {
      const x = forward ? step : width - 1 - step;
      const pixel = y * width + x;
      const value = clampWorking(working[pixel]);
      const threshold = 0.5 + (noise[noiseRow + (x % BLUE_NOISE_SIZE)] - 0.5) * WORM_BREAK_JITTER;
      const lit = value > threshold ? 1 : 0;
      ink[pixel] = 1 - lit;
      const error = (value - lit) * errorGain;
      for (let tap = 0; tap < tapCount; tap++) {
        const targetX = x + offsetsX[tap] * direction;
        const targetY = y + offsetsY[tap];
        if (targetX < 0 || targetX >= width || targetY >= height) continue;
        working[targetY * width + targetX] += error * weights[tap];
      }
    }
  }
};

export const ditherMono = (job: MonoDitherJob): Uint8Array => {
  const ink = new Uint8Array(job.width * job.height);
  if (isOrderedMethod(job.method)) orderedMono(job, ink);
  else diffuseMono(job, ink);
  return ink;
};

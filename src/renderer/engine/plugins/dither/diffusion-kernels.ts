import type { DitherMethod } from "../../types";

export type DiffusionTap = [dx: number, dy: number, weight: number];

const weighted = (divisor: number, taps: [number, number, number][]): DiffusionTap[] =>
  taps.map(([dx, dy, weight]) => [dx, dy, weight / divisor]);

export const DIFFUSION_KERNELS: Partial<Record<DitherMethod, DiffusionTap[]>> = {
  "floyd-steinberg": weighted(16, [[1, 0, 7], [-1, 1, 3], [0, 1, 5], [1, 1, 1]]),
  atkinson: weighted(8, [[1, 0, 1], [2, 0, 1], [-1, 1, 1], [0, 1, 1], [1, 1, 1], [0, 2, 1]]),
  burkes: weighted(32, [[1, 0, 8], [2, 0, 4], [-2, 1, 2], [-1, 1, 4], [0, 1, 8], [1, 1, 4], [2, 1, 2]]),
  stucki: weighted(42, [[1, 0, 8], [2, 0, 4], [-2, 1, 2], [-1, 1, 4], [0, 1, 8], [1, 1, 4], [2, 1, 2], [-2, 2, 1], [-1, 2, 2], [0, 2, 4], [1, 2, 2], [2, 2, 1]]),
  jjn: weighted(48, [[1, 0, 7], [2, 0, 5], [-2, 1, 3], [-1, 1, 5], [0, 1, 7], [1, 1, 5], [2, 1, 3], [-2, 2, 1], [-1, 2, 3], [0, 2, 5], [1, 2, 3], [2, 2, 1]]),
  sierra: weighted(32, [[1, 0, 5], [2, 0, 3], [-2, 1, 2], [-1, 1, 4], [0, 1, 5], [1, 1, 4], [2, 1, 2], [-1, 2, 2], [0, 2, 3], [1, 2, 2]]),
  "sierra-2": weighted(16, [[1, 0, 4], [2, 0, 3], [-2, 1, 1], [-1, 1, 2], [0, 1, 3], [1, 1, 2], [2, 1, 1]]),
  "sierra-lite": weighted(4, [[1, 0, 2], [-1, 1, 1], [0, 1, 1]]),
};

export const kernelFor = (method: DitherMethod): DiffusionTap[] =>
  DIFFUSION_KERNELS[method] ?? (DIFFUSION_KERNELS["floyd-steinberg"] as DiffusionTap[]);

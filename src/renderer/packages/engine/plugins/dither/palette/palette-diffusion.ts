import type { DitherMethod } from "../../../core/types";
import type { PreparedPalette } from "./palette-space";
import { matchPaletteIndex, type PaletteMatcher } from "./palette-matcher";
import { loadRow, openWindow, spreadChecked, spreadFarTaps, startRow, type DiffusionWindow } from "./diffusion-window";

const RGB_STRIDE = 3;
const RGBA_STRIDE = 4;
const ALPHA_OPAQUE = 255;
const ERROR_HEADROOM = 0.35;
const WORKING_MIN = -ERROR_HEADROOM;
const WORKING_MAX = 1 + ERROR_HEADROOM;
const STORED_MIN = Math.fround(WORKING_MIN);
const STORED_MAX = Math.fround(WORKING_MAX);
const NEXT_PIXEL_TAP = 0;

interface PaletteDiffusionJob {
  data: Float32Array;
  out: Float32Array;
  width: number;
  height: number;
  method: DitherMethod;
  errorGain: number;
  prepared: PreparedPalette;
  matcher: PaletteMatcher;
}

const clampWorking = (value: number): number =>
  value < WORKING_MIN ? STORED_MIN : value > WORKING_MAX ? STORED_MAX : value;

const writeSwatch = (out: Float32Array, pixel: number, swatches: Float32Array, swatch: number): void => {
  const target = pixel * RGBA_STRIDE;
  out[target] = swatches[swatch];
  out[target + 1] = swatches[swatch + 1];
  out[target + 2] = swatches[swatch + 2];
  out[target + 3] = ALPHA_OPAQUE;
};

const ditherRow = (job: PaletteDiffusionJob, window: DiffusionWindow, y: number): void => {
  const pass = startRow(window, y, job.height);
  const { rows, reach, carriesNextPixel } = window;
  const { prepared, matcher, width, errorGain } = job;
  const nextWeight = window.weights[NEXT_PIXEL_TAP];
  const lastColumn = width - 1;
  let carried = false;
  let carriedRed = 0;
  let carriedGreen = 0;
  let carriedBlue = 0;
  for (let step = 0; step <= lastColumn; step++) {
    const x = pass.direction > 0 ? step : lastColumn - step;
    const column = x * RGB_STRIDE;
    const at = pass.base + column;
    const red = clampWorking(carried ? carriedRed : rows[at]);
    const green = clampWorking(carried ? carriedGreen : rows[at + 1]);
    const blue = clampWorking(carried ? carriedBlue : rows[at + 2]);
    const swatch = matchPaletteIndex(matcher, red, green, blue) * RGB_STRIDE;
    writeSwatch(job.out, y * width + x, prepared.swatches, swatch);
    const errorRed = Math.fround((red - prepared.linear[swatch]) * errorGain);
    const errorGreen = Math.fround((green - prepared.linear[swatch + 1]) * errorGain);
    const errorBlue = Math.fround((blue - prepared.linear[swatch + 2]) * errorGain);
    carried = pass.interiorRow && x >= reach && x < width - reach;
    if (!carried) {
      spreadChecked(window, pass, x, job, errorRed, errorGreen, errorBlue);
      continue;
    }
    spreadFarTaps(window, column, errorRed, errorGreen, errorBlue);
    if (!carriesNextPixel) {
      carried = false;
      continue;
    }
    const next = window.tapOffsets[NEXT_PIXEL_TAP] + column;
    carriedRed = rows[next] = Math.fround(rows[next] + errorRed * nextWeight);
    carriedGreen = rows[next + 1] = Math.fround(rows[next + 1] + errorGreen * nextWeight);
    carriedBlue = rows[next + 2] = Math.fround(rows[next + 2] + errorBlue * nextWeight);
  }
};

export const diffusePalette = (job: PaletteDiffusionJob): void => {
  const window = openWindow(job.method, job.width);
  const loadUpTo = (y: number): void => {
    if (y < job.height) loadRow(job.data, job.width, window, y);
  };
  for (let y = 0; y < window.depth; y++) loadUpTo(y);
  for (let y = 0; y < job.height; y++) {
    loadUpTo(y + window.depth);
    ditherRow(job, window, y);
  }
};

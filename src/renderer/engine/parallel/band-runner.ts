import type { TransformContext, TransformMode } from "../types";
import { runTransform } from "../engine";

export type BandTransformSpec = Omit<
  TransformContext,
  "data" | "width" | "height"
> & { modes: TransformMode | TransformMode[] };

export interface BandBounds {
  startRow: number;
  bandRows: number;
}

const CHANNELS = 4;

export const planBands = (rows: number, workers: number): BandBounds[] => {
  const count = Math.max(1, Math.min(workers, rows));
  const rowsPerBand = Math.ceil(rows / count);
  const bands: BandBounds[] = [];
  for (let startRow = 0; startRow < rows; startRow += rowsPerBand) {
    bands.push({ startRow, bandRows: Math.min(rowsPerBand, rows - startRow) });
  }
  return bands;
};

// Runs one band. Kept isolated so the worker and the in-process fallback share
// the exact same code path, which is what guarantees the two produce identical
// bytes. The engine is called unchanged.
export const runBand = (
  pixels: Float32Array,
  cols: number,
  bandRows: number,
  spec: BandTransformSpec,
): Uint8ClampedArray => {
  const { modes, ...rest } = spec;
  const context: TransformContext = {
    ...rest,
    data: pixels,
    width: cols,
    height: bandRows,
  };
  const result = runTransform(modes, context);
  if (!result.colorData) {
    throw new Error("band produced no colorData");
  }
  return result.colorData;
};

export const sliceBand = (
  pixels: Float32Array,
  cols: number,
  band: BandBounds,
): Float32Array => {
  const start = band.startRow * cols * CHANNELS;
  const length = band.bandRows * cols * CHANNELS;
  return pixels.slice(start, start + length);
};

export const stitchBand = (
  output: Uint8ClampedArray,
  bandColor: Uint8ClampedArray,
  cols: number,
  band: BandBounds,
): void => {
  output.set(bandColor, band.startRow * cols * CHANNELS);
};

// Synchronous, single-threaded band runner. Used as the parity reference and as
// the fallback when workers are unavailable. Splitting here changes nothing about
// the output, it only proves the band decomposition is exact.
export const runBandedInProcess = (
  pixels: Float32Array,
  cols: number,
  rows: number,
  spec: BandTransformSpec,
  bands: number,
): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(cols * rows * CHANNELS);
  for (const band of planBands(rows, bands)) {
    const bandPixels = sliceBand(pixels, cols, band);
    const bandColor = runBand(bandPixels, cols, band.bandRows, spec);
    stitchBand(output, bandColor, cols, band);
  }
  return output;
};

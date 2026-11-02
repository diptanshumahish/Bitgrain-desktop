// The working grid for a bitmap-mode export, mirroring the sizing in
// transform.worker.ts exactly. Band-splittable chains always end in a bitmap
// mode (never char, dither, halftone, or braille), so densityBase and charAspect
// are fixed and there is no preview clamp at full resolution.
const BITMAP_DENSITY_BASE = 0.5;
const MIN_COLS = 20;
const MIN_ROWS = 10;

export interface WorkingGrid {
  cols: number;
  rows: number;
}

export const bitmapWorkingGrid = (
  width: number,
  height: number,
  resolution: number,
): WorkingGrid => {
  const cols = Math.max(MIN_COLS, Math.floor(width * resolution * BITMAP_DENSITY_BASE));
  const rows = Math.max(MIN_ROWS, Math.floor(cols * (height / width)));
  return { cols, rows };
};

const TARGET_PX_PER_CELL = 12;
const MAX_OUTPUT_SCALE = 4;
const PLATE_PIXEL_BUDGET = 7_000_000;

export const halftoneOutputScale = (
  width: number,
  height: number,
  cellPx: number,
  plateCount: number,
  supersample: boolean,
): number => {
  if (!supersample) return 1;
  const wanted = Math.min(MAX_OUTPUT_SCALE, Math.max(1, TARGET_PX_PER_CELL / cellPx));
  const budgetLimit = Math.sqrt(PLATE_PIXEL_BUDGET / (plateCount * width * height));
  return Math.max(1, Math.min(wanted, budgetLimit));
};

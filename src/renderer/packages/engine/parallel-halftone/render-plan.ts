import { renderScreenRows } from "../plugins/halftone";
import type { RowRange, ScreenPlan } from "../plugins/halftone/screen-types";
import { helperCount, requestBand } from "./band-pool";
import { splitRows } from "./split-rows";

const MIN_PARALLEL_WORK = 2_000_000;
const RGBA_STRIDE = 4;

const workFor = (plan: ScreenPlan): number => plan.outWidth * plan.outHeight * plan.grids.length;

const joinBands = (plan: ScreenPlan, ranges: RowRange[], bands: Uint8ClampedArray[]): Uint8ClampedArray => {
  const out = new Uint8ClampedArray(plan.outWidth * plan.outHeight * RGBA_STRIDE);
  ranges.forEach((rows, index) => out.set(bands[index], rows.start * plan.outWidth * RGBA_STRIDE));
  return out;
};

const remoteBand = (helperIndex: number, plan: ScreenPlan, rows: RowRange): Promise<Uint8ClampedArray> =>
  Promise.resolve().then(() => requestBand(helperIndex, plan, rows)).catch((error: unknown) => {
    console.error("halftone band fell back to the main render worker:", error);
    return renderScreenRows(plan, rows);
  });

export const renderPlan = async (plan: ScreenPlan): Promise<Uint8ClampedArray> => {
  const helpers = helperCount();
  const allRows = { start: 0, end: plan.outHeight };
  if (helpers === 0 || workFor(plan) < MIN_PARALLEL_WORK) return renderScreenRows(plan, allRows);
  const ranges = splitRows(plan.outHeight, helpers + 1);
  const remote = ranges.slice(1).map((rows, index) => remoteBand(index, plan, rows));
  const local = renderScreenRows(plan, ranges[0]);
  return joinBands(plan, ranges, [local, ...(await Promise.all(remote))]);
};

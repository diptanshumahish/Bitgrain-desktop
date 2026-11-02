import { buildCellGrid, type CellGrid } from "./cell-grid";
import { coverageWithGrit, createGritSample, sampleGrit, type CoverageHit, type CoverageProbe } from "./grid-coverage";
import type { Rgb } from "./sample-bilinear";
import type { RowRange, ScreenJob, ScreenPlan } from "./screen-types";
import { ADDITIVE_LIGHTS, SUBTRACTIVE_INKS, type ProcessInks } from "./process-inks";
import { isLightPaper } from "../../tone/paper";

const WHITE_PAPER: Rgb = [255, 255, 255];
const RGBA_STRIDE = 4;
const OPAQUE = 255;

export const processInksFor = (paper: Rgb | undefined): ProcessInks =>
  paper && !isLightPaper(paper) ? ADDITIVE_LIGHTS : SUBTRACTIVE_INKS;

export const buildCmykGrids = (job: ScreenJob): CellGrid[] => {
  const process = processInksFor(job.paper);
  return process.angles.map((angle, channel) =>
    buildCellGrid({
      source: job.source,
      width: job.width,
      height: job.height,
      cellPx: job.cellPx,
      angleDegrees: angle + job.angleWobble,
      intensity: job.intensity,
      shape: job.shape,
      resolveInk: (sample) => process.densityFor(sample, channel),
    }),
  );
};

const probesFor = (plan: ScreenPlan): CoverageProbe[] =>
  plan.grids.map((grid) => ({ grid, cellPx: plan.cellPx, edgeWidth: plan.edgeWidth, shape: plan.shape, grit: plan.grit }));

export const renderCmykRows = (plan: ScreenPlan, rows: RowRange, out: Uint8ClampedArray): void => {
  const { width, height, outScale, outWidth } = plan;
  const process = processInksFor(plan.paper);
  const probes = probesFor(plan);
  const basePaper = plan.paper ?? WHITE_PAPER;
  const hit: CoverageHit = { coverage: 0, cell: -1 };
  const grit = createGritSample();
  const paper: Rgb = [0, 0, 0];
  for (let py = rows.start; py < rows.end; py++) {
    const offsetY = (py + 0.5) / outScale - height / 2;
    const rowBase = (py - rows.start) * outWidth;
    for (let px = 0; px < outWidth; px++) {
      const offsetX = (px + 0.5) / outScale - width / 2;
      sampleGrit(offsetX, offsetY, plan.cellPx, plan.grit, grit);
      paper[0] = basePaper[0]; paper[1] = basePaper[1]; paper[2] = basePaper[2];
      for (let channel = 0; channel < probes.length; channel++) {
        coverageWithGrit(probes[channel], offsetX, offsetY, grit, hit);
        if (hit.coverage > 0) process.blend(paper, process.inks[channel], hit.coverage);
      }
      const index = (rowBase + px) * RGBA_STRIDE;
      out[index] = paper[0];
      out[index + 1] = paper[1];
      out[index + 2] = paper[2];
      out[index + 3] = OPAQUE;
    }
  }
};

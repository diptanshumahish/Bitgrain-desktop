import { buildCellGrid, type CellGrid } from "./cell-grid";
import { coverageAt, type CoverageHit, type CoverageProbe } from "./grid-coverage";
import { resolveDotInk } from "./dot-ink";
import type { Rgb } from "./sample-bilinear";
import type { RowRange, ScreenJob, ScreenPlan } from "./screen-types";
import { inkForPaper, isLightPaper } from "../../tone/paper";

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];
const RGBA_STRIDE = 4;
const COLOUR_CHANNELS = 3;
const OPAQUE = 255;

const isOnPaper = (paper: Rgb | undefined, invert: boolean): boolean => (paper ? isLightPaper(paper) : invert);

export const buildSingleGrid = (job: ScreenJob): CellGrid => {
  const onPaper = isOnPaper(job.paper, job.invert);
  const monoInk = job.paper && job.style !== "color" ? inkForPaper(job.paper) : null;
  return buildCellGrid({
    source: job.source,
    width: job.width,
    height: job.height,
    cellPx: job.cellPx,
    angleDegrees: job.baseAngle + job.angleWobble,
    intensity: job.intensity,
    shape: job.shape,
    resolveInk: (sample, colourOut) => {
      const density = resolveDotInk(sample, job.style, onPaper, colourOut);
      if (monoInk) { colourOut[0] = monoInk[0]; colourOut[1] = monoInk[1]; colourOut[2] = monoInk[2]; }
      return density;
    },
  });
};

export const renderSingleRows = (plan: ScreenPlan, rows: RowRange, out: Uint8ClampedArray): void => {
  const { width, height, outScale, outWidth } = plan;
  const grid = plan.grids[0];
  const probe: CoverageProbe = { grid, cellPx: plan.cellPx, edgeWidth: plan.edgeWidth, shape: plan.shape, grit: plan.grit };
  const paper = plan.paper ?? (isOnPaper(plan.paper, plan.invert) ? WHITE : BLACK);
  const hit: CoverageHit = { coverage: 0, cell: -1 };
  for (let py = rows.start; py < rows.end; py++) {
    const offsetY = (py + 0.5) / outScale - height / 2;
    const rowBase = (py - rows.start) * outWidth;
    for (let px = 0; px < outWidth; px++) {
      coverageAt(probe, (px + 0.5) / outScale - width / 2, offsetY, hit);
      const index = (rowBase + px) * RGBA_STRIDE;
      for (let channel = 0; channel < COLOUR_CHANNELS; channel++) {
        const ink = hit.cell < 0 ? paper[channel] : grid.colour[hit.cell * COLOUR_CHANNELS + channel];
        out[index + channel] = paper[channel] + (ink - paper[channel]) * hit.coverage;
      }
      out[index + 3] = OPAQUE;
    }
  }
};

import { dotCoverage } from "./halftone-coverage";
import type { CellGrid } from "./cell-grid";
import type { HalftoneShape } from "./halftone-defaults";
import { gritEdgeShift, gritInkFactor, gritPaperSpeck } from "./halftone-grit";

export interface CoverageHit {
  coverage: number;
  cell: number;
}

export interface CoverageProbe {
  grid: CellGrid;
  cellPx: number;
  edgeWidth: number;
  shape: HalftoneShape;
  grit: number;
}

interface GritSample {
  edgeShift: number;
  inkFactor: number;
  speck: number;
}

const NEIGHBOUR_SPAN = 1;

export const createGritSample = (): GritSample => ({ edgeShift: 0, inkFactor: 1, speck: 0 });

export const sampleGrit = (offsetX: number, offsetY: number, cellPx: number, grit: number, out: GritSample): void => {
  out.edgeShift = gritEdgeShift(offsetX, offsetY, cellPx, grit);
  out.inkFactor = gritInkFactor(offsetX, offsetY, grit);
  out.speck = gritPaperSpeck(offsetX, offsetY, grit);
};

export const coverageWithGrit = (
  probe: CoverageProbe,
  offsetX: number,
  offsetY: number,
  grit: GritSample,
  hit: CoverageHit,
): void => {
  const { grid, cellPx } = probe;
  const rotatedX = (offsetX * grid.cosA + offsetY * grid.sinA) / cellPx;
  const rotatedY = (-offsetX * grid.sinA + offsetY * grid.cosA) / cellPx;
  const baseCol = Math.floor(rotatedX);
  const baseRow = Math.floor(rotatedY);
  hit.coverage = 0;
  hit.cell = -1;
  for (let rowStep = 0; rowStep <= NEIGHBOUR_SPAN; rowStep++) {
    for (let colStep = 0; colStep <= NEIGHBOUR_SPAN; colStep++) {
      const col = baseCol + colStep;
      const row = baseRow + rowStep;
      const cell = (row + grid.reach) * grid.span + (col + grid.reach);
      const radius = grid.radius[cell] > 0 ? grid.radius[cell] + grit.edgeShift : 0;
      if (!(radius > 0)) continue;
      const coverage = dotCoverage((rotatedX - col) * cellPx, (rotatedY - row) * cellPx, radius, probe.edgeWidth, probe.shape);
      if (coverage > hit.coverage) { hit.coverage = coverage; hit.cell = cell; }
    }
  }
  if (probe.grit <= 0) return;
  hit.coverage *= grit.inkFactor;
  if (grit.speck > hit.coverage && hit.cell >= 0) hit.coverage = grit.speck;
};

const scratchGrit = createGritSample();

export const coverageAt = (probe: CoverageProbe, offsetX: number, offsetY: number, hit: CoverageHit): void => {
  sampleGrit(offsetX, offsetY, probe.cellPx, probe.grit, scratchGrit);
  coverageWithGrit(probe, offsetX, offsetY, scratchGrit, hit);
};

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

const NEIGHBOUR_OFFSETS = [0, 1];

export const coverageAt = (probe: CoverageProbe, offsetX: number, offsetY: number, hit: CoverageHit): void => {
  const { grid, cellPx } = probe;
  const rotatedX = (offsetX * grid.cosA + offsetY * grid.sinA) / cellPx;
  const rotatedY = (-offsetX * grid.sinA + offsetY * grid.cosA) / cellPx;
  const baseCol = Math.floor(rotatedX);
  const baseRow = Math.floor(rotatedY);
  const edgeShift = gritEdgeShift(offsetX, offsetY, cellPx, probe.grit);
  hit.coverage = 0;
  hit.cell = -1;
  for (const rowStep of NEIGHBOUR_OFFSETS) {
    for (const colStep of NEIGHBOUR_OFFSETS) {
      const col = baseCol + colStep;
      const row = baseRow + rowStep;
      const cell = (row + grid.reach) * grid.span + (col + grid.reach);
      const radius = grid.radius[cell] > 0 ? grid.radius[cell] + edgeShift : 0;
      if (!(radius > 0)) continue;
      const coverage = dotCoverage((rotatedX - col) * cellPx, (rotatedY - row) * cellPx, radius, probe.edgeWidth, probe.shape);
      if (coverage > hit.coverage) { hit.coverage = coverage; hit.cell = cell; }
    }
  }
  if (probe.grit <= 0) return;
  hit.coverage *= gritInkFactor(offsetX, offsetY, probe.grit);
  const speck = gritPaperSpeck(offsetX, offsetY, probe.grit);
  if (speck > hit.coverage && hit.cell >= 0) hit.coverage = speck;
};

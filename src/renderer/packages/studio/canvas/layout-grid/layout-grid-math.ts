import type { LayoutGrid } from "@bitgrain/studio-core/model/layout-grid-types";

interface GridBand {
  start: number;
  size: number;
}

interface GridLines {
  x: number[];
  y: number[];
}

const MIN_SQUARE_SIZE = 1;
const MAX_SQUARE_LINES = 2000;

export const gridBands = (grid: LayoutGrid, length: number): GridBand[] => {
  const count = Math.max(1, Math.round(grid.count));
  const usable = length - grid.margin * 2 - grid.gutter * (count - 1);
  const bandSize = usable / count;
  if (bandSize <= 0) return [];
  return Array.from({ length: count }, (_, index) => ({
    start: grid.margin + index * (bandSize + grid.gutter),
    size: bandSize,
  }));
};

export const squareLines = (size: number, length: number): number[] => {
  const step = Math.max(MIN_SQUARE_SIZE, size);
  const count = Math.min(MAX_SQUARE_LINES, Math.floor(length / step));
  return Array.from({ length: count + 1 }, (_, index) => index * step);
};

const bandEdges = (bands: GridBand[]): number[] => bands.flatMap((band) => [band.start, band.start + band.size]);

const linesForGrid = (grid: LayoutGrid, width: number, height: number): GridLines => {
  if (grid.kind === "columns") return { x: bandEdges(gridBands(grid, width)), y: [] };
  if (grid.kind === "rows") return { x: [], y: bandEdges(gridBands(grid, height)) };
  return { x: squareLines(grid.size, width), y: squareLines(grid.size, height) };
};

export const layoutGridLines = (grids: LayoutGrid[] | undefined, width: number, height: number): GridLines => {
  const visible = (grids ?? []).filter((grid) => grid.visible);
  return visible.reduce<GridLines>(
    (all, grid) => {
      const lines = linesForGrid(grid, width, height);
      return { x: [...all.x, ...lines.x], y: [...all.y, ...lines.y] };
    },
    { x: [], y: [] },
  );
};

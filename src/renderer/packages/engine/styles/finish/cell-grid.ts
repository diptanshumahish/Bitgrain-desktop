import type { SourceImage } from "../engine/style-definition";

const CELL_WIDTH_RATIO = 0.6;
const CHANNELS = 4;
const BOX_SAMPLES_PER_SIDE = 3;

export interface CellGrid {
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
}

export type Rgb = [number, number, number];

export const buildCellGrid = (width: number, height: number, cellSize: number, coverEdges: boolean): CellGrid => {
  const cellHeight = Math.max(1, cellSize);
  const cellWidth = Math.max(1, cellSize * CELL_WIDTH_RATIO);
  const round = coverEdges ? Math.ceil : Math.floor;
  return {
    columns: Math.max(1, round(width / cellWidth)),
    rows: Math.max(1, round(height / cellHeight)),
    cellWidth,
    cellHeight,
  };
};

export const squareCellGrid = (width: number, height: number, cellSize: number): CellGrid => {
  const size = Math.max(1, cellSize);
  return { columns: Math.ceil(width / size), rows: Math.ceil(height / size), cellWidth: size, cellHeight: size };
};

export const forEachCell = (grid: CellGrid, visit: (column: number, row: number) => void): void => {
  for (let row = 0; row < grid.rows; row++) {
    for (let column = 0; column < grid.columns; column++) visit(column, row);
  }
};

export const centreIndex =(source: SourceImage, grid: CellGrid, column: number, row: number): number => {
  const x = Math.min(source.width - 1, Math.floor((column + 0.5) * grid.cellWidth));
  const y = Math.min(source.height - 1, Math.floor((row + 0.5) * grid.cellHeight));
  return (y * source.width + x) * CHANNELS;
};

export const pointColour = (source: SourceImage, index: number): Rgb =>
  [source.data[index], source.data[index + 1], source.data[index + 2]];

export const boxAverage = (source: SourceImage, grid: CellGrid, column: number, row: number): Rgb => {
  const left = Math.floor(column * grid.cellWidth);
  const top = Math.floor(row * grid.cellHeight);
  const right = Math.min(source.width, Math.floor((column + 1) * grid.cellWidth));
  const bottom = Math.min(source.height, Math.floor((row + 1) * grid.cellHeight));
  const step = Math.max(1, Math.floor((right - left) / BOX_SAMPLES_PER_SIDE));
  const total: Rgb = [0, 0, 0];
  let count = 0;
  for (let y = top; y < bottom; y += step) {
    for (let x = left; x < right; x += step) {
      const index = (y * source.width + x) * CHANNELS;
      total[0] += source.data[index];
      total[1] += source.data[index + 1];
      total[2] += source.data[index + 2];
      count++;
    }
  }
  return count > 0 ? [total[0] / count, total[1] / count, total[2] / count] : pointColour(source, centreIndex(source, grid, column, row));
};

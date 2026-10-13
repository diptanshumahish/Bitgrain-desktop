import { lumaByte } from "../../tone/luminance";

const RGBA_STRIDE = 4;
const BYTE_MAX = 255;

export interface CellSamples {
  levels: Float32Array;
  colours: Float32Array;
}

export interface CellGridSize {
  width: number;
  height: number;
  cols: number;
  rows: number;
}

const accumulateCell = (data: Float32Array, size: CellGridSize, col: number, row: number, out: Float32Array, offset: number): void => {
  const fromX = Math.floor((col * size.width) / size.cols);
  const toX = Math.max(fromX + 1, Math.floor(((col + 1) * size.width) / size.cols));
  const fromY = Math.floor((row * size.height) / size.rows);
  const toY = Math.max(fromY + 1, Math.floor(((row + 1) * size.height) / size.rows));
  let count = 0;
  for (let y = fromY; y < toY && y < size.height; y++) {
    for (let x = fromX; x < toX && x < size.width; x++) {
      const index = (y * size.width + x) * RGBA_STRIDE;
      out[offset] += data[index];
      out[offset + 1] += data[index + 1];
      out[offset + 2] += data[index + 2];
      count++;
    }
  }
  if (count === 0) return;
  out[offset] /= count;
  out[offset + 1] /= count;
  out[offset + 2] /= count;
};

export const sampleCells = (data: Float32Array, size: CellGridSize): CellSamples => {
  const cellCount = size.cols * size.rows;
  const colours = new Float32Array(cellCount * 3);
  const levels = new Float32Array(cellCount);
  for (let row = 0; row < size.rows; row++) {
    for (let col = 0; col < size.cols; col++) {
      const cell = row * size.cols + col;
      accumulateCell(data, size, col, row, colours, cell * 3);
      const level = lumaByte(colours[cell * 3], colours[cell * 3 + 1], colours[cell * 3 + 2]) / BYTE_MAX;
      levels[cell] = level < 0 ? 0 : level > 1 ? 1 : level;
    }
  }
  return { levels, colours };
};

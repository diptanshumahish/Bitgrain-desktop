import type { ShapeDefinition, ShapePath } from "./shape-geometry";

const LIT = "1";

const BITMAPS: Readonly<Record<string, readonly string[]>> = {
  invader: ["00100", "01110", "11111", "10101", "01010"],
  invader2: ["01000010", "11111111", "11011011", "11111111", "00111100", "01100110"],
  ghost: ["01110", "11111", "10101", "11111", "10101"],
  plus: ["00100", "00100", "11111", "00100", "00100"],
  xmark: ["10001", "01010", "00100", "01010", "10001"],
  chevUp: ["00100", "01110", "11011", "10001", "00000"],
  chevDn: ["00000", "10001", "11011", "01110", "00100"],
  checker: ["10101", "01010", "10101", "01010", "10101"],
  smiley: ["01110", "10101", "11111", "10001", "01110"],
};

const bitmapPath = (rows: readonly string[]): ShapePath => (path, x, y, size) => {
  const columns = rows[0].length;
  const pixel = size / columns;
  const left = x - size / 2;
  const top = y - (pixel * rows.length) / 2;
  rows.forEach((line, row) => {
    for (let column = 0; column < columns; column++) {
      if (line[column] === LIT) path.rect(left + column * pixel, top + row * pixel, pixel, pixel);
    }
  });
};

export const BITMAP_SHAPES: Readonly<Record<string, ShapeDefinition>> = Object.fromEntries(
  Object.entries(BITMAPS).map(([name, rows]) => [name, { trace: bitmapPath(rows), evenOdd: false }]),
);

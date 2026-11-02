import type { DrawContext } from "../../engine/frame";

export const FORENSIC_RAMP_ID = "forensic";

const GLYPH_MASKS: Readonly<Record<string, number>> = {
  ".": 128,
  ":": 131200,
  "-": 14336,
  "=": 459200,
  "+": 4357252,
  "*": 4897444,
  "#": 11512810,
  "@": 15724526,
};

const GLYPH_SIDE = 5;
const GRID_COLUMNS = 6;
const GRID_ROWS = 7;
const TOP_MARGIN_ROWS = 1;
const LAST_BIT = GLYPH_SIDE * GLYPH_SIDE - 1;

const isLit = (mask: number, row: number, column: number): boolean =>
  ((mask >> (LAST_BIT - (row * GLYPH_SIDE + column))) & 1) === 1;

export const drawForensicGlyph = (
  context: DrawContext, glyph: string, left: number, top: number, cellWidth: number, cellHeight: number,
): void => {
  const mask = GLYPH_MASKS[glyph] ?? 0;
  if (mask === 0) return;
  const unitWidth = cellWidth / GRID_COLUMNS;
  const unitHeight = cellHeight / GRID_ROWS;
  for (let row = 0; row < GLYPH_SIDE; row++) {
    for (let column = 0; column < GLYPH_SIDE; column++) {
      if (!isLit(mask, row, column)) continue;
      const x = Math.round(left + column * unitWidth);
      const y = Math.round(top + (row + TOP_MARGIN_ROWS) * unitHeight);
      context.fillRect(x, y, Math.round(left + (column + 1) * unitWidth) - x, Math.round(top + (row + TOP_MARGIN_ROWS + 1) * unitHeight) - y);
    }
  }
};

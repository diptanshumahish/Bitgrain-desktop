export const FORENSIC_GLYPHS = "@#*+=-:. ";

const FORENSIC_SIDE = 5;
const FORENSIC_COLUMNS = 6;
const FORENSIC_ROWS = 7;
const TOP_BIT = FORENSIC_SIDE * FORENSIC_SIDE - 1;

const MASKS: Readonly<Record<string, number>> = {
  " ": 0,
  ".": 128,
  ":": 131200,
  "-": 14336,
  "=": 459200,
  "+": 4357252,
  "*": 4897444,
  "#": 11512810,
  "@": 15724526,
};

export const forensicMask = (glyph: string): number => MASKS[glyph] ?? 0;

const forensicBitLit = (mask: number, row: number, column: number): boolean =>
  ((mask >> (TOP_BIT - (row * FORENSIC_SIDE + column))) & 1) === 1;

export interface ForensicBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

type ForensicPixelVisitor = (box: ForensicBox) => void;

export const forEachForensicPixel = (mask: number, cell: ForensicBox, visit: ForensicPixelVisitor): void => {
  const pixelWidth = cell.width / FORENSIC_COLUMNS;
  const pixelHeight = cell.height / FORENSIC_ROWS;
  for (let row = 0; row < FORENSIC_SIDE; row++) {
    for (let column = 0; column < FORENSIC_SIDE; column++) {
      if (!forensicBitLit(mask, row, column)) continue;
      const left = Math.round(cell.left + column * pixelWidth);
      const top = Math.round(cell.top + (row + 1) * pixelHeight);
      const right = Math.round(cell.left + (column + 1) * pixelWidth);
      const bottom = Math.round(cell.top + (row + 2) * pixelHeight);
      visit({ left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) });
    }
  }
};

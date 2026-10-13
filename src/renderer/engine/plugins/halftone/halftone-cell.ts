import { HALFTONE_LEGACY_CELL, HALFTONE_MIN_CELL_PX } from "./halftone-defaults";

interface CellInput {
  width: number;
  height: number;
  halftoneLines?: number;
  halftoneCell?: number;
}

export const resolveHalftoneCell = (input: CellInput): number => {
  const longEdge = Math.max(input.width, input.height);
  const requested = input.halftoneLines && input.halftoneLines > 0
    ? longEdge / input.halftoneLines
    : input.halftoneCell ?? HALFTONE_LEGACY_CELL;
  return Math.max(HALFTONE_MIN_CELL_PX, requested);
};

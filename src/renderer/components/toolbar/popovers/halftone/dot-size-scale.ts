import { HALFTONE_LINES_MAX, HALFTONE_LINES_MIN, HALFTONE_MIN_CELL_PX } from "../../../../engine/plugins/halftone/halftone-defaults";

export const DOT_SIZE_MIN = HALFTONE_LINES_MIN;
export const DOT_SIZE_MAX = HALFTONE_LINES_MAX;
export const DOT_SIZE_STEP = 10;

export const dotSizeFromLines = (lines: number): number => HALFTONE_LINES_MAX + HALFTONE_LINES_MIN - lines;

export const linesFromDotSize = (dotSize: number): number => HALFTONE_LINES_MAX + HALFTONE_LINES_MIN - dotSize;

const CUSTOM_READOUT = "custom";

export const dotPitchReadout = (lines: number, imageLongEdge: number | null): string => {
  if (lines <= 0) return CUSTOM_READOUT;
  if (!imageLongEdge) return `${lines} across`;
  const pitch = Math.max(HALFTONE_MIN_CELL_PX, imageLongEdge / lines);
  return `${Math.round(pitch)} px`;
};

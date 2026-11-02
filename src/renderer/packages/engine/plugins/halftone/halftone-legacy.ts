import { HALFTONE_DEFAULTS, HALFTONE_LEGACY_CELL } from "./halftone-defaults";

const USE_LEGACY_CELL = 0;

interface LegacyHalftoneFields {
  halftoneLines?: number;
  halftoneCell?: number;
}

export const linesFromSnapshot = (fields: LegacyHalftoneFields): number => {
  if (fields.halftoneLines !== undefined) return fields.halftoneLines;
  const hasCustomCell = fields.halftoneCell !== undefined && fields.halftoneCell !== HALFTONE_LEGACY_CELL;
  return hasCustomCell ? USE_LEGACY_CELL : HALFTONE_DEFAULTS.lines;
};

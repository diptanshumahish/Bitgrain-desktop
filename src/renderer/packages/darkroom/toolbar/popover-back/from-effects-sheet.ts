import type { ActivePopover } from "../toolbar-types";

const FROM_EFFECTS_SHEET: ActivePopover[] = [
  "algorithm", "halftone", "popart", "ascii", "braille", "contour", "inkwash", "manga", "styles",
  "lut", "haze-bloom", "filters", "palette",
];

export const isFromEffectsSheet = (active: ActivePopover): boolean => FROM_EFFECTS_SHEET.includes(active);

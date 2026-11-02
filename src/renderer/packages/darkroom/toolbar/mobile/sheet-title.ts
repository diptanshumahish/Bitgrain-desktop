import type { ActivePopover } from "../toolbar-types";

const SHEET_TITLES: Partial<Record<Exclude<ActivePopover, null>, string>> = {
  lut: "film grade",
  "haze-bloom": "haze and glow",
  popart: "pop art",
  inkwash: "ink wash",
  algorithm: "dither",
  "recipe-add": "add step",
  finish: "paper texture",
};

export const sheetTitle = (active: ActivePopover, showEffects: boolean): string => {
  if (showEffects) return "effects";
  if (!active) return "";
  return SHEET_TITLES[active] ?? active;
};

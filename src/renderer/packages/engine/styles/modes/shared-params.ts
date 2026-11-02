import type { NumberParamSpec } from "../engine/style-types";
import { FINISH_KEYS } from "../finish/finish-params";

export const CELL_SIZE_KEY = "size";
const TEXT_BACKDROP_SOFTNESS = 2;
export const TEXT_FINISH_DEFAULTS = { [FINISH_KEYS.backdropBlur]: TEXT_BACKDROP_SOFTNESS };
const CELL_SIZE_MIN = 3;
const CELL_SIZE_MAX = 80;
const DEFAULT_CELL_SIZE = 11;

export const cellSizeParam = (label: string, defaultSize = DEFAULT_CELL_SIZE, min = CELL_SIZE_MIN): NumberParamSpec => ({
  kind: "number",
  key: CELL_SIZE_KEY,
  label,
  min,
  max: CELL_SIZE_MAX,
  step: 1,
  default: defaultSize,
  suffix: "px",
  scalesWithExport: true,
});

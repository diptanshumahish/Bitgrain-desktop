import type { TransformMode } from "../../../engine/types";
import { isFilterMode } from "../filter-modes";

const GRAIN_MODE: TransformMode = "grain";
const TRAILING_STACKED_MODE: TransformMode = "haze-bloom";
const ORIGINAL_MODE: TransformMode = "original";

const isLeadingStacked = (mode: TransformMode): boolean =>
  mode === GRAIN_MODE || isFilterMode(mode);

const isTrailingStacked = (mode: TransformMode): boolean => mode === TRAILING_STACKED_MODE;

export const isStackedMode = (mode: TransformMode): boolean =>
  isLeadingStacked(mode) || isTrailingStacked(mode);

export const mainEffectOf = (modes: TransformMode[]): TransformMode =>
  modes.find((mode) => !isStackedMode(mode)) ?? ORIGINAL_MODE;

export const swapMainEffect = (modes: TransformMode[], effect: TransformMode): TransformMode[] => [
  ...modes.filter(isLeadingStacked),
  effect,
  ...modes.filter(isTrailingStacked),
];

export const withoutMode = (modes: TransformMode[], target: TransformMode): TransformMode[] => {
  const remaining = modes.filter((mode) => mode !== target);
  const hasMain = remaining.some((mode) => !isStackedMode(mode));
  return hasMain ? remaining : swapMainEffect(remaining, ORIGINAL_MODE);
};

const withFilterAdded = (modes: TransformMode[], filter: TransformMode): TransformMode[] => {
  const base = modes.some((mode) => !isStackedMode(mode)) ? modes : swapMainEffect(modes, ORIGINAL_MODE);
  return [...base.filter(isLeadingStacked), filter, ...base.filter((mode) => !isLeadingStacked(mode))];
};

export const toggleStackedFilter = (modes: TransformMode[], filter: TransformMode): TransformMode[] =>
  modes.includes(filter) ? withoutMode(modes, filter) : withFilterAdded(modes, filter);

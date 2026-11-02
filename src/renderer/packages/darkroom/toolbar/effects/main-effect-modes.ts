import type { TransformMode } from "@bitgrain/engine/core/types";
import { isFilterMode } from "../filter-modes";
import { HAZE_MODE } from "@bitgrain/engine/utils/haze-order";

const GRAIN_MODE: TransformMode = "grain";
const ORIGINAL_MODE: TransformMode = "original";

export const isStackedMode = (mode: TransformMode): boolean =>
  mode === GRAIN_MODE || mode === HAZE_MODE || isFilterMode(mode);

export const mainEffectOf = (modes: TransformMode[]): TransformMode =>
  modes.find((mode) => !isStackedMode(mode)) ?? ORIGINAL_MODE;

export const swapMainEffect = (modes: TransformMode[], effect: TransformMode): TransformMode[] => [
  ...modes.filter(isStackedMode),
  effect,
];

export const withoutMode = (modes: TransformMode[], target: TransformMode): TransformMode[] => {
  const remaining = modes.filter((mode) => mode !== target);
  const hasMain = remaining.some((mode) => !isStackedMode(mode));
  return hasMain ? remaining : swapMainEffect(remaining, ORIGINAL_MODE);
};

const withFilterAdded = (modes: TransformMode[], filter: TransformMode): TransformMode[] => {
  const base = modes.some((mode) => !isStackedMode(mode)) ? modes : swapMainEffect(modes, ORIGINAL_MODE);
  return [...base.filter(isStackedMode), filter, ...base.filter((mode) => !isStackedMode(mode))];
};

export const toggleStackedFilter = (modes: TransformMode[], filter: TransformMode): TransformMode[] =>
  modes.includes(filter) ? withoutMode(modes, filter) : withFilterAdded(modes, filter);

import type { TransformMode } from "../core/types";

export const HAZE_MODE: TransformMode = "haze-bloom";

export const withHazeFirst = (modes: TransformMode[]): TransformMode[] =>
  modes.includes(HAZE_MODE) ? [HAZE_MODE, ...modes.filter((mode) => mode !== HAZE_MODE)] : modes;

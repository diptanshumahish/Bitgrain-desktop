import type { TransformMode } from "@bitgrain/engine/core/types";
import type { PreviewJob } from "./preview-lane";

const DRAFTLESS_MODES: ReadonlySet<TransformMode> = new Set<TransformMode>(["ascii", "braille", "grunge"]);
const FAST_FULL_RENDER_MS = 70;
const DRAFT_TARGET_MS = 40;
const INITIAL_DRAFT_BUDGET = 360_000;
const MIN_DRAFT_BUDGET = 90_000;
const MAX_DRAFT_BUDGET = 1_200_000;
const MAX_BUDGET_STEP = 2;
const MIN_ELAPSED_MS = 1;

export interface ProgressiveState {
  generation: number;
  paintedGeneration: number;
  paintedFull: boolean;
  fullTimer: number;
  pendingFull: PreviewJob | null;
  draftBudget: number;
  fullRenderMs: number;
  sourceWidth: number;
  sourceHeight: number;
}

export const createProgressiveState = (): ProgressiveState => ({
  generation: 0,
  paintedGeneration: 0,
  paintedFull: true,
  fullTimer: 0,
  pendingFull: null,
  draftBudget: INITIAL_DRAFT_BUDGET,
  fullRenderMs: Number.POSITIVE_INFINITY,
  sourceWidth: 0,
  sourceHeight: 0,
});

export const resetForNewImage = (state: ProgressiveState, sourceWidth: number, sourceHeight: number): void => {
  state.paintedGeneration = state.generation;
  state.paintedFull = true;
  state.fullRenderMs = Number.POSITIVE_INFINITY;
  state.sourceWidth = sourceWidth;
  state.sourceHeight = sourceHeight;
};

const lastModeOf = (mode: TransformMode | TransformMode[]): TransformMode =>
  Array.isArray(mode) ? mode[mode.length - 1] : mode;

export const shouldDraft = (state: ProgressiveState, mode: TransformMode | TransformMode[]): boolean =>
  !DRAFTLESS_MODES.has(lastModeOf(mode)) && state.fullRenderMs > FAST_FULL_RENDER_MS;

export const isFirstRender = (state: ProgressiveState): boolean =>
  state.fullRenderMs === Number.POSITIVE_INFINITY;

export const draftParamsFor = (state: ProgressiveState, params: Record<string, unknown>): Record<string, unknown> => ({
  ...params,
  halftoneSupersample: false,
  draftPixelBudget: state.draftBudget,
  sourceWidth: state.sourceWidth,
  sourceHeight: state.sourceHeight,
});

export const recordRenderTime = (state: ProgressiveState, isFull: boolean, elapsedMs: number): void => {
  if (isFull) {
    state.fullRenderMs = elapsedMs;
    return;
  }
  const ratio = DRAFT_TARGET_MS / Math.max(MIN_ELAPSED_MS, elapsedMs);
  const step = Math.min(MAX_BUDGET_STEP, Math.max(1 / MAX_BUDGET_STEP, ratio));
  state.draftBudget = Math.min(MAX_DRAFT_BUDGET, Math.max(MIN_DRAFT_BUDGET, state.draftBudget * step));
};

export const claimPaint = (state: ProgressiveState, generation: number, isFull: boolean): boolean => {
  const newer = generation > state.paintedGeneration;
  const upgrades = generation === state.paintedGeneration && isFull && !state.paintedFull;
  if (!newer && !upgrades) return false;
  state.paintedGeneration = generation;
  state.paintedFull = isFull;
  return true;
};

import type { TransformMode } from "@bitgrain/engine/core/types";
import { submitToLane, type PreviewLane } from "./preview-lane";
import { draftParamsFor, isFirstRender, shouldDraft, type ProgressiveState } from "./progressive-state";

const FULL_RENDER_IDLE_MS = 160;

export interface PreviewLanes {
  full: PreviewLane;
  draft: PreviewLane;
}

export const flushPendingFull = (lanes: PreviewLanes, state: ProgressiveState): void => {
  window.clearTimeout(state.fullTimer);
  const job = state.pendingFull;
  state.pendingFull = null;
  if (job) submitToLane(lanes.full, job);
};

export const dispatchPreview = (
  lanes: PreviewLanes,
  state: ProgressiveState,
  params: Record<string, unknown>,
  mode: TransformMode | TransformMode[],
): void => {
  state.generation += 1;
  const fullJob = { generation: state.generation, params };
  window.clearTimeout(state.fullTimer);
  state.pendingFull = null;
  if (!shouldDraft(state, mode)) {
    submitToLane(lanes.full, fullJob);
    return;
  }
  submitToLane(lanes.draft, { generation: state.generation, params: draftParamsFor(state, params) });
  const delay = isFirstRender(state) ? 0 : FULL_RENDER_IDLE_MS;
  state.pendingFull = fullJob;
  state.fullTimer = window.setTimeout(() => flushPendingFull(lanes, state), delay);
};

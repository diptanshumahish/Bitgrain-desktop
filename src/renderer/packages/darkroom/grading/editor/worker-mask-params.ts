import type { MaskLayer, WorkerMaskLayer } from "@bitgrain/engine/grading/mask/mask-types";
import { isMaskLayerActive, toWorkerMask } from "@bitgrain/engine/grading/mask/mask-defaults";

interface WorkerMaskParams {
  masks: WorkerMaskLayer[];
  overlayMaskId: string | null;
}

export const buildWorkerMaskParams = (
  masks: readonly MaskLayer[] | undefined,
  overlayMaskId: string | null | undefined,
): WorkerMaskParams => {
  const overlayId = overlayMaskId ?? null;
  const relevant = (masks ?? []).filter((mask) => isMaskLayerActive(mask) || mask.id === overlayId);
  return { masks: relevant.map(toWorkerMask), overlayMaskId: overlayId };
};

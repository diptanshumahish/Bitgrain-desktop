import type { MaskLayer, WorkerMaskLayer } from "../mask/mask-types";
import { isMaskLayerActive, toWorkerMask } from "../mask/mask-defaults";

export interface WorkerMaskParams {
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

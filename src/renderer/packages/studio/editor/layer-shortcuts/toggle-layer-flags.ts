import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { findSelectedLayers, updateLayersRecursively } from "@bitgrain/studio-core/layers/studio-layers";
import { canBeMask } from "@bitgrain/studio-core/mask/mask-runs";
import { maskSelectionWithTopLayer } from "./mask-selection";

export const toggleLocked = (layers: Layer[], ids: string[]): Layer[] => {
  const shouldLock = findSelectedLayers(layers, ids).some((layer) => !layer.locked);
  return updateLayersRecursively(layers, ids, () => ({ locked: shouldLock }));
};

export const toggleVisible = (layers: Layer[], ids: string[]): Layer[] => {
  const shouldHide = findSelectedLayers(layers, ids).some((layer) => layer.visible !== false);
  return updateLayersRecursively(layers, ids, () => ({ visible: !shouldHide }));
};

export const toggleMask = (layers: Layer[], ids: string[]): Layer[] => {
  const targets = findSelectedLayers(layers, ids).filter(canBeMask);
  const shouldMask = targets.some((layer) => !layer.isMask);
  const grouped = ids.length > 1 && targets.every((layer) => !layer.isMask) ? maskSelectionWithTopLayer(layers, ids) : null;
  if (grouped) return grouped;
  return updateLayersRecursively(layers, targets.map((layer) => layer.id), () => ({ isMask: shouldMask }));
};

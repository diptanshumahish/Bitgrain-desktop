import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { isContainerLayer, makeGroupLayer } from "@bitgrain/studio-core/layers/studio-layers";
import { canBeMask } from "@bitgrain/studio-core/mask/mask-runs";

const MASK_GROUP_NAME = "Mask group";

const maskGroupFor = (picked: Layer[]): Layer | null => {
  const mask = [...picked].reverse().find(canBeMask);
  if (!mask) return null;
  const members = picked.filter((layer) => layer.id !== mask.id);
  return { ...makeGroupLayer([{ ...mask, isMask: true }, ...members]), name: MASK_GROUP_NAME };
};

const maskSiblings = (siblings: Layer[], ids: string[]): Layer[] | null => {
  const picked = siblings.filter((layer) => ids.includes(layer.id));
  if (picked.length !== ids.length) return null;
  const group = maskGroupFor(picked);
  if (!group) return null;
  const topIndex = siblings.findIndex((layer) => layer.id === picked[picked.length - 1].id);
  const insertAt = siblings.slice(0, topIndex).filter((layer) => !ids.includes(layer.id)).length;
  const rest = siblings.filter((layer) => !ids.includes(layer.id));
  return [...rest.slice(0, insertAt), group, ...rest.slice(insertAt)];
};

export const maskSelectionWithTopLayer = (layers: Layer[], ids: string[]): Layer[] | null => {
  const masked = maskSiblings(layers, ids);
  if (masked) return masked;
  for (const [index, layer] of layers.entries()) {
    if (!isContainerLayer(layer)) continue;
    const inner = maskSelectionWithTopLayer(layer.layers, ids);
    if (inner) return layers.map((existing, position) => (position === index ? ({ ...layer, layers: inner } as Layer) : existing));
  }
  return null;
};

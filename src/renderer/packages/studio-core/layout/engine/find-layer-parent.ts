import type { FrameLayer, GroupLayer, Layer } from "../../model/studio-types";

export type LayerParent = GroupLayer | FrameLayer | null;

interface LayerParentMatch {
  parent: LayerParent;
}

export const findLayerParent = (layers: Layer[], id: string, parent: LayerParent = null): LayerParentMatch | null => {
  for (const layer of layers) {
    if (layer.id === id) return { parent };
    if (layer.type !== "group" && layer.type !== "frame") continue;
    const match = findLayerParent(layer.layers, id, layer);
    if (match) return match;
  }
  return null;
};

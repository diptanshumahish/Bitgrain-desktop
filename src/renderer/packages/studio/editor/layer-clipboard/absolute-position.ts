import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { findAncestorGroupIds, findLayerById } from "@bitgrain/studio-core/layers/studio-layers";

interface Offset {
  x: number;
  y: number;
}

const ancestorOffset = (layers: Layer[], id: string): Offset =>
  (findAncestorGroupIds(layers, id) ?? []).reduce<Offset>((offset, ancestorId) => {
    const ancestor = findLayerById(layers, ancestorId);
    return ancestor ? { x: offset.x + ancestor.x, y: offset.y + ancestor.y } : offset;
  }, { x: 0, y: 0 });

export const withPagePosition = (layers: Layer[], layer: Layer): Layer => {
  const offset = ancestorOffset(layers, layer.id);
  return { ...layer, x: layer.x + offset.x, y: layer.y + offset.y };
};

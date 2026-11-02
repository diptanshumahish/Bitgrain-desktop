import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { Rect } from "@bitgrain/studio-core/layers/frame-tree";
import { isContainerLayer } from "@bitgrain/studio-core/layers/studio-layers";

interface PaintEntry {
  layer: Layer;
  rect: Rect;
}

export const flattenPaintOrder = (layers: Layer[], originX = 0, originY = 0): PaintEntry[] =>
  layers.flatMap((layer) => {
    const rect = { x: originX + layer.x, y: originY + layer.y, width: layer.width, height: layer.height };
    const own: PaintEntry = { layer, rect };
    if (!isContainerLayer(layer) || !layer.visible) return [own];
    return [own, ...flattenPaintOrder(layer.layers, rect.x, rect.y)];
  });

export const containsPoint = (rect: Rect, pointX: number, pointY: number): boolean =>
  pointX >= rect.x && pointX <= rect.x + rect.width && pointY >= rect.y && pointY <= rect.y + rect.height;

export const layersBelow = (layers: Layer[], id: string): { layers: Layer[]; found: boolean } => {
  const kept: Layer[] = [];
  for (const layer of layers) {
    if (layer.id === id) return { layers: kept, found: true };
    if (isContainerLayer(layer)) {
      const inner = layersBelow(layer.layers, id);
      if (inner.found) return { layers: [...kept, { ...layer, layers: inner.layers } as Layer], found: true };
    }
    kept.push(layer);
  }
  return { layers: kept, found: false };
};

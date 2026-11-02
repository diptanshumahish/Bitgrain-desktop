import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { LayerBox } from "../../ui/layer-box-map";

interface SelectionBounds {
  width: number;
  height: number;
  boxes: LayerBox[];
}

export const selectionBounds = (layers: Layer[]): SelectionBounds => {
  if (layers.length === 0) return { width: 0, height: 0, boxes: [] };
  const minX = Math.min(...layers.map((layer) => layer.x));
  const minY = Math.min(...layers.map((layer) => layer.y));
  const maxX = Math.max(...layers.map((layer) => layer.x + layer.width));
  const maxY = Math.max(...layers.map((layer) => layer.y + layer.height));
  return {
    width: maxX - minX,
    height: maxY - minY,
    boxes: layers.map((layer) => ({ id: layer.id, x: layer.x - minX, y: layer.y - minY, width: layer.width, height: layer.height })),
  };
};

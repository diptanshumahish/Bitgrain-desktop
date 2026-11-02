import type { Layer } from "../model/studio-types";
import { rotatedBounds, type LayerBounds } from "./layer-bounds";

export const isOutsideBounds = (layer: Layer, bounds: LayerBounds): boolean => {
  const box = rotatedBounds(layer);
  return (
    box.x + box.width < bounds.x ||
    box.x > bounds.x + bounds.width ||
    box.y + box.height < bounds.y ||
    box.y > bounds.y + bounds.height
  );
};

export const layersInsideBounds = (layers: Layer[], bounds: LayerBounds): Layer[] =>
  layers.filter((layer) => !isOutsideBounds(layer, bounds));

export const isWithinBounds = (layer: Layer, bounds: LayerBounds): boolean => {
  const box = rotatedBounds(layer);
  return (
    box.x >= bounds.x &&
    box.y >= bounds.y &&
    box.x + box.width <= bounds.x + bounds.width &&
    box.y + box.height <= bounds.y + bounds.height
  );
};

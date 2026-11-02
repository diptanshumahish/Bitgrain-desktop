import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { ImagePlacementPoint } from "../../plugins/host/types";
import { isContainerLayer } from "@bitgrain/studio-core/layers/studio-layers";

const DEGREES_TO_RADIANS = Math.PI / 180;
const HALF = 2;

const layerRotation = (layer: Layer): number => ("rotation" in layer ? layer.rotation ?? 0 : 0);

const toLayerSpace = (layer: Layer, point: ImagePlacementPoint): ImagePlacementPoint => {
  const centerX = layer.x + layer.width / HALF;
  const centerY = layer.y + layer.height / HALF;
  const angle = -layerRotation(layer) * DEGREES_TO_RADIANS;
  const offsetX = point.x - centerX;
  const offsetY = point.y - centerY;
  return {
    x: centerX + offsetX * Math.cos(angle) - offsetY * Math.sin(angle) - layer.x,
    y: centerY + offsetX * Math.sin(angle) + offsetY * Math.cos(angle) - layer.y,
  };
};

const isInside = (layer: Layer, local: ImagePlacementPoint): boolean =>
  local.x >= 0 && local.y >= 0 && local.x <= layer.width && local.y <= layer.height;

const isDropTarget = (layer: Layer): boolean => layer.type === "image" || layer.type === "upload";

export const findImageLayerAt = (layers: Layer[], point: ImagePlacementPoint): string | null => {
  for (const layer of [...layers].reverse()) {
    if (layer.visible === false || layer.locked) continue;
    const local = toLayerSpace(layer, point);
    if (!isInside(layer, local)) continue;
    if (isContainerLayer(layer)) {
      const nested = findImageLayerAt(layer.layers, local);
      if (nested) return nested;
      continue;
    }
    if (isDropTarget(layer)) return layer.id;
  }
  return null;
};

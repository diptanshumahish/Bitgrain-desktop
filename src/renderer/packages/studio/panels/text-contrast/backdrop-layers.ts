import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { Rect } from "@bitgrain/studio-core/layers/frame-tree";
import { isActiveMask } from "@bitgrain/studio-core/mask/mask-runs";

const HALF = 2;

const reachesRect = (layer: Layer, rect: Rect): boolean => {
  const radius = Math.hypot(layer.width, layer.height) / HALF;
  const centerX = layer.x + layer.width / HALF;
  const centerY = layer.y + layer.height / HALF;
  return (
    centerX + radius >= rect.x &&
    centerX - radius <= rect.x + rect.width &&
    centerY + radius >= rect.y &&
    centerY - radius <= rect.y + rect.height
  );
};

export const layersReachingRect = (layers: Layer[], rect: Rect): Layer[] =>
  layers.some(isActiveMask) ? layers : layers.filter((layer) => layer.visible && reachesRect(layer, rect));

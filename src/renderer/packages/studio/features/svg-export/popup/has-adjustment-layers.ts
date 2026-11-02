import type { Layer } from "@bitgrain/studio-core/model/studio-types";

const childLayersOf = (layer: Layer): Layer[] => {
  if (!("layers" in layer) || !Array.isArray(layer.layers)) return [];
  return layer.layers as Layer[];
};

export const hasAdjustmentLayers = (layers: Layer[]): boolean =>
  layers.some((layer) => layer.visible && (layer.type === "adjustment" || hasAdjustmentLayers(childLayersOf(layer))));

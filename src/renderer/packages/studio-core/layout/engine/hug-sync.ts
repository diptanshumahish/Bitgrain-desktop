import type { Layer } from "../../model/studio-types";
import { hasAutoLayout, isLayoutContainer } from "./layout-container";
import { fitContainerSize } from "./fit-size";

const resolveHugSize = (layer: Layer): Layer => {
  if (!isLayoutContainer(layer) || !hasAutoLayout(layer)) return layer;
  const hugW = layer.layoutSizingH === "hug";
  const hugH = layer.layoutSizingV === "hug";
  if (!hugW && !hugH) return layer;
  const fitted = fitContainerSize(layer);
  if (!fitted) return layer;
  const width = hugW ? fitted.width : layer.width;
  const height = hugH ? fitted.height : layer.height;
  if (width === layer.width && height === layer.height) return layer;
  return { ...layer, width, height } as Layer;
};

const syncLayer = (layer: Layer): Layer => {
  if (!isLayoutContainer(layer)) return layer;
  const children = syncHugSizes(layer.layers);
  const withChildren = children === layer.layers ? layer : ({ ...layer, layers: children } as Layer);
  return resolveHugSize(withChildren);
};

export const syncHugSizes = (layers: Layer[]): Layer[] => {
  const next = layers.map(syncLayer);
  return next.some((layer, index) => layer !== layers[index]) ? next : layers;
};

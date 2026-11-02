import type { GroupLayer, Layer } from "../model/studio-types";
import { isContainerLayer } from "./studio-layers";

const isEmptyGroup = (layer: Layer): boolean => layer.type === "group" && (layer as GroupLayer).layers.length === 0;

export const removeLayersByIds = (layers: Layer[], ids: string[]): Layer[] =>
  layers
    .filter((layer) => !ids.includes(layer.id))
    .map((layer) => (isContainerLayer(layer) ? { ...layer, layers: removeLayersByIds(layer.layers, ids) } : layer))
    .filter((layer) => !isEmptyGroup(layer));

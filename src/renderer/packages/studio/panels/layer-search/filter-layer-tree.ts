import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { isContainerLayer, type ContainerLayer } from "@bitgrain/studio-core/layers/studio-layers";

export interface FilteredLayerTree {
  layers: Layer[];
  expandedIds: Set<string>;
}

const textContentMatches = (layer: Layer, needle: string): boolean =>
  layer.type === "text" && layer.content.toLowerCase().includes(needle);

const nameMatches = (layer: Layer, needle: string): boolean =>
  layer.name.toLowerCase().includes(needle) || textContentMatches(layer, needle);

const filterLevel = (layers: Layer[], needle: string, expandedIds: Set<string>): Layer[] =>
  layers.flatMap((layer): Layer[] => {
    if (!isContainerLayer(layer)) return nameMatches(layer, needle) ? [layer] : [];
    const children = filterLevel(layer.layers, needle, expandedIds);
    if (children.length === 0) return nameMatches(layer, needle) ? [layer] : [];
    expandedIds.add(layer.id);
    return [{ ...layer, layers: children } as ContainerLayer];
  });

export const normalizeQuery = (query: string): string => query.trim().toLowerCase();

export const filterLayerTree = (layers: Layer[], query: string): FilteredLayerTree => {
  const expandedIds = new Set<string>();
  const filtered = filterLevel(layers, normalizeQuery(query), expandedIds);
  return { layers: filtered, expandedIds };
};

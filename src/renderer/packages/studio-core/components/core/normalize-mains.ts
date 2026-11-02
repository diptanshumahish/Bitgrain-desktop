import type { Layer } from "../../model/studio-types";
import { flattenTree, isComponentContainer, withChildren, type LayerPageLike } from "../tree/layer-walk";

const mainLayerIdsByComponent = (pages: LayerPageLike[]): Map<string, string[]> => {
  const ids = new Map<string, string[]>();
  for (const page of pages) {
    for (const layer of flattenTree(page.layers)) {
      if (!layer.component) continue;
      ids.set(layer.component.id, [...(ids.get(layer.component.id) ?? []), layer.id]);
    }
  }
  return ids;
};

const pickKeeper = (layerIds: string[], previousIds: string[]): string =>
  layerIds.find((layerId) => previousIds.includes(layerId)) ?? layerIds[0];

const toInstance = (layer: Layer): Layer => {
  const { component, ...rest } = layer;
  const instance = { ...rest, instance: { componentId: component?.id ?? "" } } as Layer;
  return withChildren(instance, []);
};

const convertCopies = (layers: Layer[], copyIds: Set<string>): Layer[] =>
  layers.map((layer) => {
    if (copyIds.has(layer.id)) return toInstance(layer);
    if (!isComponentContainer(layer)) return layer;
    return withChildren(layer, convertCopies(layer.layers, copyIds));
  });

const duplicateMainCopies = (prev: LayerPageLike[], next: LayerPageLike[]): Set<string> => {
  const previous = mainLayerIdsByComponent(prev);
  const copies = new Set<string>();
  for (const [componentId, layerIds] of mainLayerIdsByComponent(next)) {
    if (layerIds.length < 2) continue;
    const keeper = pickKeeper(layerIds, previous.get(componentId) ?? []);
    layerIds.filter((layerId) => layerId !== keeper).forEach((layerId) => copies.add(layerId));
  }
  return copies;
};

export const normalizeDuplicateMains = <P extends LayerPageLike>(prev: LayerPageLike[], next: P[]): P[] => {
  const copies = duplicateMainCopies(prev, next);
  if (copies.size === 0) return next;
  return next.map((page) => ({ ...page, layers: convertCopies(page.layers, copies) }));
};

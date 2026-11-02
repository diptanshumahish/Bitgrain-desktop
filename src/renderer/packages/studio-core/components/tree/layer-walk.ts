import type { FrameLayer, GroupLayer, Layer } from "../../model/studio-types";

export interface LayerPageLike {
  id: string;
  layers: Layer[];
}

export type ComponentContainer = GroupLayer | FrameLayer;

export const isComponentContainer = (layer: Layer): layer is ComponentContainer =>
  layer.type === "group" || layer.type === "frame";

export const childrenOf = (layer: Layer): Layer[] => (isComponentContainer(layer) ? layer.layers : []);

export const withChildren = (layer: Layer, layers: Layer[]): Layer =>
  isComponentContainer(layer) ? ({ ...layer, layers } as Layer) : layer;

export const flattenTree = (layers: Layer[]): Layer[] =>
  layers.flatMap((layer) => [layer, ...flattenTree(childrenOf(layer))]);

export const indexTree = (layers: Layer[]): Map<string, Layer> =>
  new Map(flattenTree(layers).map((layer) => [layer.id, layer]));

export const mapTopLevelInstances = (layers: Layer[], map: (instance: Layer) => Layer): Layer[] => {
  let changed = false;
  const next = layers.map((layer) => {
    const mapped = layer.instance ? map(layer) : mapNestedInstances(layer, map);
    if (mapped !== layer) changed = true;
    return mapped;
  });
  return changed ? next : layers;
};

const mapNestedInstances = (layer: Layer, map: (instance: Layer) => Layer): Layer => {
  if (!isComponentContainer(layer)) return layer;
  const nextChildren = mapTopLevelInstances(layer.layers, map);
  return nextChildren === layer.layers ? layer : withChildren(layer, nextChildren);
};

const mapLayerById = (layers: Layer[], id: string, map: (layer: Layer) => Layer): Layer[] => {
  let changed = false;
  const next = layers.map((layer) => {
    const mapped = layer.id === id ? map(layer) : mapChildById(layer, id, map);
    if (mapped !== layer) changed = true;
    return mapped;
  });
  return changed ? next : layers;
};

const mapChildById = (layer: Layer, id: string, map: (layer: Layer) => Layer): Layer => {
  if (!isComponentContainer(layer)) return layer;
  const nextChildren = mapLayerById(layer.layers, id, map);
  return nextChildren === layer.layers ? layer : withChildren(layer, nextChildren);
};

export const mapPagesLayerById = <P extends LayerPageLike>(
  pages: P[],
  id: string,
  map: (layer: Layer) => Layer,
): P[] =>
  pages.map((page) => {
    const layers = mapLayerById(page.layers, id, map);
    return layers === page.layers ? page : { ...page, layers };
  });

interface LocatedLayer {
  layer: Layer;
  pageId: string;
}

export const locateInPages = (pages: LayerPageLike[], id: string): LocatedLayer | null => {
  for (const page of pages) {
    const found = indexTree(page.layers).get(id);
    if (found) return { layer: found, pageId: page.id };
  }
  return null;
};

export const findInstanceAncestor = (layers: Layer[], id: string): Layer | null => {
  for (const layer of layers) {
    if (layer.id === id) return layer.instance ? layer : null;
    if (!isComponentContainer(layer)) continue;
    if (layer.instance && indexTree(layer.layers).has(id)) return layer;
    const inner = findInstanceAncestor(layer.layers, id);
    if (inner) return inner;
  }
  return null;
};

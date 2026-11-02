import type { Layer } from "../../model/studio-types";
import { deepEqual } from "../tree/deep-equal";
import { detectOverrides } from "./detect-overrides";
import { flattenTree, mapTopLevelInstances, type LayerPageLike } from "../tree/layer-walk";
import { normalizeDuplicateMains } from "./normalize-mains";
import { createMainResolver, type MainResolver } from "./resolve-mains";
import { hasComponentData, resolveInstancesWith } from "./resolve-pages";
import { isComponentFreeChange } from "./component-free-change";

const indexInstances = (pages: LayerPageLike[]): Map<string, Layer> => {
  const index = new Map<string, Layer>();
  for (const page of pages) {
    for (const layer of flattenTree(page.layers)) {
      if (layer.instance) index.set(layer.id, layer);
    }
  }
  return index;
};

const applyDetected = (instance: Layer, before: Layer | undefined, resolver: MainResolver): Layer => {
  const meta = instance.instance;
  if (!meta || !before || before === instance) return instance;
  if (before.instance?.componentId !== meta.componentId) return instance;
  const main = resolver.resolve(meta.componentId);
  if (!main) return instance;
  const overrides = detectOverrides(before, instance, main);
  if (deepEqual(overrides, meta.overrides ?? {})) return instance;
  return { ...instance, instance: { ...meta, overrides } } as Layer;
};

const detectAll = <P extends LayerPageLike>(pages: P[], previous: Map<string, Layer>): P[] => {
  const resolver = createMainResolver(pages);
  return pages.map((page) => {
    const layers = mapTopLevelInstances(page.layers, (instance) => applyDetected(instance, previous.get(instance.id), resolver));
    return layers === page.layers ? page : { ...page, layers };
  });
};

export const syncComponents = <P extends LayerPageLike>(prev: LayerPageLike[], next: P[]): P[] => {
  if (prev === next || isComponentFreeChange(prev, next) || !hasComponentData(next)) return next;
  const previous = indexInstances(prev);
  const detected = detectAll(normalizeDuplicateMains(prev, next), previous);
  return resolveInstancesWith(detected, createMainResolver(detected), (instance) => previous.has(instance.id));
};

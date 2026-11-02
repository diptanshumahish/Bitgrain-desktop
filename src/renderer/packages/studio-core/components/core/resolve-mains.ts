import type { Layer } from "../../model/studio-types";
import { buildInstance } from "./build-instance";
import { flattenTree, isComponentContainer, mapTopLevelInstances, withChildren, type ComponentContainer, type LayerPageLike } from "../tree/layer-walk";

export interface MainResolver {
  resolve: (componentId: string) => ComponentContainer | null;
  isResolving: (componentId: string) => boolean;
}

const collectMainLayers = (pages: LayerPageLike[]): Map<string, ComponentContainer> => {
  const mains = new Map<string, ComponentContainer>();
  for (const page of pages) {
    for (const layer of flattenTree(page.layers)) {
      if (layer.component && isComponentContainer(layer) && !mains.has(layer.component.id)) {
        mains.set(layer.component.id, layer);
      }
    }
  }
  return mains;
};

export const rebuildWith = (instance: Layer, resolver: MainResolver, keepForeign: boolean): Layer => {
  const meta = instance.instance;
  if (!meta) return instance;
  if (resolver.isResolving(meta.componentId)) return withChildren(instance, []);
  const main = resolver.resolve(meta.componentId);
  return main ? buildInstance(instance, meta, main, keepForeign) : instance;
};

export const createMainResolver = (pages: LayerPageLike[]): MainResolver => {
  const mains = collectMainLayers(pages);
  const cache = new Map<string, ComponentContainer>();
  const resolving = new Set<string>();
  const resolver: MainResolver = {
    isResolving: (componentId) => resolving.has(componentId),
    resolve: (componentId) => {
      const cached = cache.get(componentId);
      if (cached) return cached;
      const main = mains.get(componentId);
      if (!main) return null;
      resolving.add(componentId);
      const layers = mapTopLevelInstances(main.layers, (nested) => rebuildWith(nested, resolver, true));
      resolving.delete(componentId);
      const resolved = (layers === main.layers ? main : withChildren(main, layers)) as ComponentContainer;
      cache.set(componentId, resolved);
      return resolved;
    },
  };
  return resolver;
};

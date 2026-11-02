import type { Layer } from "../../model/studio-types";
import { deepEqual } from "../tree/deep-equal";
import { childrenOf, mapTopLevelInstances, type LayerPageLike } from "../tree/layer-walk";
import { createMainResolver, rebuildWith, type MainResolver } from "./resolve-mains";

type ForeignChildPolicy = (instance: Layer) => boolean;

const KEEP_ALL_FOREIGN: ForeignChildPolicy = () => true;

const treeHasComponentData = (layers: Layer[]): boolean =>
  layers.some((layer) => Boolean(layer.component || layer.instance) || treeHasComponentData(childrenOf(layer)));

export const pageHasComponentData = (page: LayerPageLike): boolean => treeHasComponentData(page.layers);

export const hasComponentData = (pages: LayerPageLike[]): boolean => pages.some(pageHasComponentData);

const rebuildIfChanged = (instance: Layer, resolver: MainResolver, policy: ForeignChildPolicy): Layer => {
  const rebuilt = rebuildWith(instance, resolver, policy(instance));
  return rebuilt === instance || deepEqual(rebuilt, instance) ? instance : rebuilt;
};

export const resolveInstancesWith = <P extends LayerPageLike>(
  pages: P[],
  resolver: MainResolver,
  policy: ForeignChildPolicy = KEEP_ALL_FOREIGN,
): P[] => {
  let changed = false;
  const next = pages.map((page) => {
    const layers = mapTopLevelInstances(page.layers, (instance) => rebuildIfChanged(instance, resolver, policy));
    if (layers === page.layers) return page;
    changed = true;
    return { ...page, layers };
  });
  return changed ? next : pages;
};

export const resolvePagesInstances = <P extends LayerPageLike>(pages: P[]): P[] => {
  if (!hasComponentData(pages)) return pages;
  return resolveInstancesWith(pages, createMainResolver(pages));
};

import type { Layer } from "../../model/studio-types";
import type { InstanceMeta, InstanceResizeMode } from "../../model/component-types";
import { createMainResolver } from "../core/resolve-mains";
import { remapOverrides } from "../registry/remap-overrides";
import { mapPagesLayerById, type LayerPageLike } from "../tree/layer-walk";
import { omitLayerKeys } from "../tree/layer-keys";

const updateMeta = (layer: Layer, update: (meta: InstanceMeta) => InstanceMeta): Layer =>
  layer.instance ? ({ ...layer, instance: update(layer.instance) } as Layer) : layer;

export const detachInstance = <P extends LayerPageLike>(pages: P[], layerId: string): P[] =>
  mapPagesLayerById(pages, layerId, (layer) =>
    layer.instance ? (omitLayerKeys(layer, ["instance"]) as unknown as Layer) : layer,
  );

export const resetOverrides = <P extends LayerPageLike>(pages: P[], layerId: string, overrideKey?: string): P[] =>
  mapPagesLayerById(pages, layerId, (layer) =>
    updateMeta(layer, (meta) => {
      if (!overrideKey) return { ...meta, overrides: undefined };
      const overrides = { ...(meta.overrides ?? {}) };
      delete overrides[overrideKey];
      return { ...meta, overrides };
    }),
  );

export const setInstanceResize = <P extends LayerPageLike>(pages: P[], layerId: string, resize: InstanceResizeMode): P[] =>
  mapPagesLayerById(pages, layerId, (layer) => updateMeta(layer, (meta) => ({ ...meta, resize })));

export const swapInstance = <P extends LayerPageLike>(pages: P[], layerId: string, componentId: string): P[] => {
  const resolver = createMainResolver(pages);
  const target = resolver.resolve(componentId);
  if (!target) return pages;
  return mapPagesLayerById(pages, layerId, (layer) => {
    const meta = layer.instance;
    if (!meta || meta.componentId === componentId) return layer;
    const current = resolver.resolve(meta.componentId);
    const overrides = current ? remapOverrides(meta.overrides ?? {}, current, target) : {};
    return {
      ...layer,
      width: target.width,
      height: target.height,
      instance: { ...meta, componentId, overrides },
    } as Layer;
  });
};

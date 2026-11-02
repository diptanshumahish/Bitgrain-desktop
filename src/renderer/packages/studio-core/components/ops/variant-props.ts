import type { Layer } from "../../model/studio-types";
import type { ComponentMeta, VariantProps } from "../../model/component-types";
import { childrenOf, isComponentContainer, withChildren, type LayerPageLike } from "../tree/layer-walk";

type MetaUpdate = (meta: ComponentMeta) => ComponentMeta;

const NEW_PROPERTY_VALUE = "Default";

const mapMetaInLayers = (layers: Layer[], setId: string, update: MetaUpdate): Layer[] =>
  layers.map((layer) => {
    const updated = layer.component?.setId === setId ? ({ ...layer, component: update(layer.component) } as Layer) : layer;
    if (!isComponentContainer(updated)) return updated;
    return withChildren(updated, mapMetaInLayers(childrenOf(updated), setId, update));
  });

const mapSetMembers = <P extends LayerPageLike>(pages: P[], setId: string, update: MetaUpdate): P[] =>
  pages.map((page) => ({ ...page, layers: mapMetaInLayers(page.layers, setId, update) }));

const renameKey = (variant: VariantProps, from: string, to: string): VariantProps =>
  Object.fromEntries(Object.entries(variant).map(([name, value]) => [name === from ? to : name, value]));

export const renameComponentSet = <P extends LayerPageLike>(pages: P[], setId: string, setName: string): P[] =>
  mapSetMembers(pages, setId, (meta) => ({ ...meta, setName }));

export const renameVariantProperty = <P extends LayerPageLike>(pages: P[], setId: string, from: string, to: string): P[] =>
  mapSetMembers(pages, setId, (meta) => ({ ...meta, variant: renameKey(meta.variant ?? {}, from, to) }));

export const addVariantProperty = <P extends LayerPageLike>(pages: P[], setId: string, name: string): P[] =>
  mapSetMembers(pages, setId, (meta) => ({ ...meta, variant: { ...(meta.variant ?? {}), [name]: NEW_PROPERTY_VALUE } }));

export const setVariantValue = <P extends LayerPageLike>(
  pages: P[],
  componentId: string,
  property: string,
  value: string,
): P[] =>
  pages.map((page) => ({
    ...page,
    layers: mapComponentById(page.layers, componentId, (meta) => ({ ...meta, variant: { ...(meta.variant ?? {}), [property]: value } })),
  }));

const mapComponentById = (layers: Layer[], componentId: string, update: MetaUpdate): Layer[] =>
  layers.map((layer) => {
    const updated = layer.component?.id === componentId ? ({ ...layer, component: update(layer.component) } as Layer) : layer;
    if (!isComponentContainer(updated)) return updated;
    return withChildren(updated, mapComponentById(childrenOf(updated), componentId, update));
  });

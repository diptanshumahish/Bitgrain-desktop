import type { Layer } from "../../model/studio-types";
import type { ComponentMeta, VariantProps } from "../../model/component-types";
import { makeComponentId, makeComponentSetId } from "../core/instance-ids";
import {
  childrenOf, isComponentContainer, locateInPages, mapPagesLayerById, withChildren, type LayerPageLike,
} from "../tree/layer-walk";
import { cloneWithFreshIds } from "./clone-tree";
import type { PagesOpResult } from "./pages-op-result";

const VARIANT_GAP = 40;
const DEFAULT_PROPERTY = "State";
const DEFAULT_VALUE = "Default";

const insertAfter = (layers: Layer[], anchorId: string, addition: Layer): Layer[] =>
  layers.flatMap((layer) => {
    if (layer.id === anchorId) return [layer, addition];
    if (!isComponentContainer(layer)) return [layer];
    return [withChildren(layer, insertAfter(childrenOf(layer), anchorId, addition))];
  });

const baseVariant = (meta: ComponentMeta): VariantProps =>
  meta.variant && Object.keys(meta.variant).length > 0 ? meta.variant : { [DEFAULT_PROPERTY]: DEFAULT_VALUE };

const nextVariant = (variant: VariantProps, memberCount: number): VariantProps => {
  const [firstProperty] = Object.keys(variant);
  return { ...variant, [firstProperty]: `Variant ${memberCount + 1}` };
};

const countMembers = (pages: LayerPageLike[], setId: string): number =>
  pages.reduce((total, page) => total + countInLayers(page.layers, setId), 0);

const countInLayers = (layers: Layer[], setId: string): number =>
  layers.reduce(
    (total, layer) => total + (layer.component?.setId === setId ? 1 : 0) + countInLayers(childrenOf(layer), setId),
    0,
  );

export const addVariant = <P extends LayerPageLike>(pages: P[], mainLayerId: string): PagesOpResult<P> | null => {
  const located = locateInPages(pages, mainLayerId);
  const meta = located?.layer.component;
  if (!located || !meta) return null;
  const setId = meta.setId ?? makeComponentSetId();
  const variant = baseVariant(meta);
  const mainMeta: ComponentMeta = { ...meta, setId, setName: meta.setName ?? located.layer.name, variant };
  const updated = mapPagesLayerById(pages, mainLayerId, (layer) => ({ ...layer, component: mainMeta }) as Layer);
  const memberCount = Math.max(1, countMembers(updated, setId));
  const clone = {
    ...cloneWithFreshIds(located.layer),
    x: located.layer.x + located.layer.width + VARIANT_GAP,
    component: { ...mainMeta, id: makeComponentId(), variant: nextVariant(variant, memberCount) },
  } as Layer;
  const nextPages = updated.map((page) =>
    page.id === located.pageId ? { ...page, layers: insertAfter(page.layers, mainLayerId, clone) } : page,
  );
  return { pages: nextPages, layerId: clone.id };
};

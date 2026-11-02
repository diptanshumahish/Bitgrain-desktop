import type { Layer } from "../../model/studio-types";
import { makeGroupLayer } from "../../layers/studio-layers";
import { insertGroupAtTopMember } from "../../layers/layer-order";
import { makeComponentId } from "../core/instance-ids";
import type { PagesOpResult } from "./pages-op-result";
import { findInstanceAncestor, indexTree, isComponentContainer, mapPagesLayerById, type LayerPageLike } from "../tree/layer-walk";

const DEFAULT_COMPONENT_NAME = "Component";

const isInsideInstance = (layers: Layer[], id: string): boolean => {
  const ancestor = findInstanceAncestor(layers, id);
  return ancestor !== null && ancestor.id !== id;
};

const markAsComponent = (layer: Layer): Layer => ({ ...layer, component: { id: makeComponentId() } });

const canMarkDirectly = (layer: Layer | undefined): layer is Layer =>
  Boolean(layer && isComponentContainer(layer) && !layer.component && !layer.instance && !(layer.type === "group" && layer.pattern));

const wrapTopLevel = <P extends LayerPageLike>(pages: P[], page: P, ids: string[]): PagesOpResult<P> | null => {
  const members = page.layers.filter((layer) => ids.includes(layer.id));
  if (members.length === 0) return null;
  const group = markAsComponent({ ...makeGroupLayer(members), name: DEFAULT_COMPONENT_NAME });
  const layers = insertGroupAtTopMember(page.layers, members.map((layer) => layer.id), group);
  return { pages: pages.map((entry) => (entry.id === page.id ? { ...entry, layers } : entry)), layerId: group.id };
};

export const createComponent = <P extends LayerPageLike>(pages: P[], pageId: string, ids: string[]): PagesOpResult<P> | null => {
  const page = pages.find((entry) => entry.id === pageId);
  if (!page || ids.length === 0) return null;
  if (ids.some((id) => isInsideInstance(page.layers, id))) return null;
  const single = ids.length === 1 ? indexTree(page.layers).get(ids[0]) : undefined;
  if (canMarkDirectly(single)) {
    return { pages: mapPagesLayerById(pages, single.id, markAsComponent), layerId: single.id };
  }
  return wrapTopLevel(pages, page, ids);
};

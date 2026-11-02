import type { Layer } from "../../model/studio-types";
import { makeLayerCopyId } from "../core/instance-ids";
import { childrenOf, withChildren } from "../tree/layer-walk";

export const cloneWithFreshIds = (layer: Layer): Layer => {
  const copy = { ...layer, id: makeLayerCopyId(layer.id) } as Layer;
  if (layer.instance) return withChildren(copy, []);
  return withChildren(copy, childrenOf(layer).map(cloneWithFreshIds));
};

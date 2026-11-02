import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { isContainerLayer } from "@bitgrain/studio-core/layers/studio-layers";

export const flattenLayers = (layers: Layer[]): Layer[] =>
  layers.flatMap((layer) => (isContainerLayer(layer) ? [layer, ...flattenLayers(layer.layers)] : [layer]));

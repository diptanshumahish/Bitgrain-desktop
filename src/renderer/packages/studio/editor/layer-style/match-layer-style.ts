import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { isContainerLayer } from "@bitgrain/studio-core/layers/studio-layers";
import { readFill } from "./style-fill";

const matchSignature = (layer: Layer): string => {
  const values = layer as unknown as Record<string, unknown>;
  const detail = layer.type === "text" ? values.fontFamily : readFill(layer.type, values);
  return `${layer.type}|${String(detail ?? "")}`;
};

const flattenLayers = (layers: Layer[]): Layer[] =>
  layers.flatMap((layer) => (isContainerLayer(layer) ? [layer, ...flattenLayers(layer.layers)] : [layer]));

export const findMatchingLayerIds = (layers: Layer[], source: Layer): string[] => {
  const signature = matchSignature(source);
  return flattenLayers(layers)
    .filter((layer) => layer.visible !== false && !layer.locked && matchSignature(layer) === signature)
    .map((layer) => layer.id);
};

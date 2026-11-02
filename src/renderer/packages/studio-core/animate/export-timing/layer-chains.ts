import type { Layer } from "../../model/studio-types";

const collectChains = (layers: Layer[], ancestors: Layer[], chains: Map<string, Layer[]>): void => {
  for (const layer of layers) {
    const chain = [...ancestors, layer];
    chains.set(layer.id, chain);
    if (layer.type === "group" || layer.type === "frame") collectChains(layer.layers, chain, chains);
  }
};

export const buildLayerChains = (baseLayers: Layer[]): Map<string, Layer[]> => {
  const chains = new Map<string, Layer[]>();
  collectChains(baseLayers, [], chains);
  return chains;
};

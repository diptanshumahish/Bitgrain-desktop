import type { Layer } from "../../data/studioTypes";

export interface StudioLayerSummary {
  layerCount: number;
  layerTypes: Record<string, number>;
  effectKinds: string[];
}

const collectLayers = (layers: Layer[]): Layer[] =>
  layers.flatMap((layer) =>
    layer.type === "group" || layer.type === "frame" ? [layer, ...collectLayers(layer.layers)] : [layer],
  );

const effectKindOf = (layer: Layer): string | null =>
  "bitgrainEffect" in layer && layer.bitgrainEffect ? layer.bitgrainEffect.kind : null;

export function summarizeLayers(layers: Layer[]): StudioLayerSummary {
  const allLayers = collectLayers(layers);
  const layerTypes: Record<string, number> = {};
  allLayers.forEach((layer) => {
    layerTypes[layer.type] = (layerTypes[layer.type] ?? 0) + 1;
  });
  const effectKinds = allLayers.map(effectKindOf).filter((kind): kind is string => kind !== null);
  return { layerCount: allLayers.length, layerTypes, effectKinds: [...new Set(effectKinds)] };
}

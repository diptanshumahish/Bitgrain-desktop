import type { Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { isContainerLayer } from "@bitgrain/studio-core/layers/studio-layers";

type LayerMapper = (layer: Layer) => Layer;

const mapLayers = (layers: Layer[], mapper: LayerMapper): Layer[] => {
  let changed = false;
  const next = layers.map((layer) => {
    let mapped = mapper(layer);
    if (isContainerLayer(mapped)) {
      const children = mapLayers(mapped.layers, mapper);
      if (children !== mapped.layers) mapped = { ...mapped, layers: children } as Layer;
    }
    if (mapped !== layer) changed = true;
    return mapped;
  });
  return changed ? next : layers;
};

export const mapPagesLayersDeep = (pages: TemplatePage[], mapper: LayerMapper): TemplatePage[] => {
  let changed = false;
  const next = pages.map((page) => {
    const layers = mapLayers(page.layers, mapper);
    if (layers === page.layers) return page;
    changed = true;
    return { ...page, layers };
  });
  return changed ? next : pages;
};

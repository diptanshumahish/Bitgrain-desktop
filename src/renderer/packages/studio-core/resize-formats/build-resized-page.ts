import type { Layer, TemplatePage } from "../model/studio-types";
import type { DesignFormat } from "../design-sizes/new-design-formats";
import { toPageSafeZones, type PageSafeZone } from "../design-sizes/safe-zone-types";
import { makeFitContext } from "../templates/canvas-fit/fit-context";
import { fitLayers } from "../templates/canvas-fit/fit-layer";

const freshLayerIds = (layers: Layer[]): Layer[] =>
  layers.map((layer) => {
    if (layer.type === "group" || layer.type === "frame") {
      return { ...layer, id: crypto.randomUUID(), layers: freshLayerIds(layer.layers) };
    }
    return { ...layer, id: crypto.randomUUID() };
  });

const safeZonesFor = (format: DesignFormat): PageSafeZone[] | undefined =>
  format.safeZones ? toPageSafeZones(format.safeZones, format.width, format.height) : undefined;

const reflowLayers = (source: TemplatePage, format: DesignFormat, safeZones: PageSafeZone[] | undefined): Layer[] => {
  if (source.width <= 0 || source.height <= 0) return source.layers;
  const context = makeFitContext(source, format, safeZones);
  return freshLayerIds(fitLayers(source.layers, context));
};

export const buildResizedPage = (source: TemplatePage, format: DesignFormat, x: number, y: number): TemplatePage => {
  const safeZones = safeZonesFor(format);
  return {
    id: crypto.randomUUID(),
    name: format.label,
    layers: reflowLayers(source, format, safeZones),
    background: source.background,
    backgroundVar: source.backgroundVar,
    x,
    y,
    width: format.width,
    height: format.height,
    image: source.image,
    safeZones,
  };
};

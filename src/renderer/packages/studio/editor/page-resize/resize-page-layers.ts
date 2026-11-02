import type { Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { resizeContainerChildren } from "../../layers/resize/container-resize";

const scaleLayerBoxes = (layers: Layer[], scaleX: number, scaleY: number): Layer[] =>
  layers.map((layer) => ({
    ...layer,
    x: Math.round(layer.x * scaleX),
    y: Math.round(layer.y * scaleY),
    width: Math.round(layer.width * scaleX),
    height: Math.round(layer.height * scaleY),
  }));

const pageScalesContents = (page: TemplatePage): boolean => page.scaleContents ?? true;

export const resizePageLayers = (page: TemplatePage, width: number, height: number): Layer[] => {
  if (width === page.width && height === page.height) return page.layers;
  if (pageScalesContents(page)) return scaleLayerBoxes(page.layers, width / page.width, height / page.height);
  return resizeContainerChildren(page.layers, {
    scaleContents: false,
    from: { width: page.width, height: page.height },
    to: { width, height },
  });
};

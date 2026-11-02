import type { Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { isOutsideBounds, isWithinBounds } from "@bitgrain/studio-core/geometry/off-page-bounds";
import type { LayerDragSession } from "./layer-drag-session";
import type { LayerBounds } from "@bitgrain/studio-core/geometry/layer-bounds";

interface PageLayerSplit {
  onPage: Layer[];
  offPage: Layer[];
  dragged: Layer[];
}

const sessionForPage = (page: TemplatePage, session: LayerDragSession | null): LayerDragSession | null =>
  session && session.pageId === page.id ? session : null;

const pageBounds = (page: TemplatePage): LayerBounds => ({ x: 0, y: 0, width: page.width, height: page.height });

const startedOffPage = (layer: Layer, page: TemplatePage, session: LayerDragSession | null): boolean => {
  if (session?.layerIds.includes(layer.id)) return session.startedOffPageIds.includes(layer.id);
  return isOutsideBounds(layer, pageBounds(page));
};

const isFloatingWhileDragged = (layer: Layer, page: TemplatePage, session: LayerDragSession | null): boolean => {
  if (!session?.layerIds.includes(layer.id)) return false;
  return session.startedOffPageIds.includes(layer.id) || !isWithinBounds(layer, pageBounds(page));
};

export const splitPageLayers = (page: TemplatePage, session: LayerDragSession | null): PageLayerSplit => {
  const pageSession = sessionForPage(page, session);
  return {
    onPage: page.layers.filter((layer) => !startedOffPage(layer, page, pageSession)),
    offPage: page.layers.filter((layer) => startedOffPage(layer, page, pageSession)),
    dragged: page.layers.filter((layer) => isFloatingWhileDragged(layer, page, pageSession)),
  };
};

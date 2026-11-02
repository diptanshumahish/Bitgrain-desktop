import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { isLayerGated, type CommonLayerProps, type LayerGate, type LayerItemHandlers } from "./layer-item-types";

const Z_INDEX_STEP = 10;

export const layerZIndex = (index: number): number => (index + 1) * Z_INDEX_STEP;

interface CommonLayerPropsArgs {
  layer: Layer;
  index: number;
  zoom: number;
  hideSelectionUi: boolean;
  gate: LayerGate;
  handlers: LayerItemHandlers;
}

export const buildCommonLayerProps = ({
  layer, index, zoom, hideSelectionUi, gate, handlers,
}: CommonLayerPropsArgs): CommonLayerProps => {
  const gated = isLayerGated(layer, gate);
  return {
    scale: zoom,
    zIndex: layerZIndex(index),
    hideSelectionUi,
    interactive: !gated,
    onSelect: (multi) => {
      if (!gated) handlers.onSelectLayer(layer.id, multi);
    },
    onMoveDelta: (dx, dy) => {
      if (!layer.locked) handlers.onMoveDelta(layer.id, dx, dy);
    },
    onMoveEnd: () => handlers.onMoveEnd(layer.id),
    onResizeDelta: (dir, dx, dy) => {
      if (!layer.locked) handlers.onResizeDelta(layer.id, dir, dx, dy);
    },
    onResizeEnd: () => handlers.onResizeEnd(layer.id),
    onContextMenu: (event) => handlers.onLayerContextMenu(layer.id, event.clientX, event.clientY),
  };
};

import React from "react";
import type { FrameLayer, GroupLayer } from "@bitgrain/studio-core/model/studio-types";
import { GroupLayerView } from "../../layers/GroupLayerView";
import { FrameLayerView } from "../../layers/FrameLayerView";
import type { LayerGate, LayerItemHandlers } from "./layer-item-types";
import { layerZIndex } from "./build-common-layer-props";

interface ContainerLayerItemProps {
  layer: GroupLayer | FrameLayer;
  index: number;
  selectedIds: string[];
  editingId: string | null;
  vectorEditingId: string | null;
  nodeEditMode: "move" | "bend";
  image: string | null;
  zoom: number;
  hideSelectionUi: boolean;
  gate: LayerGate;
  handlers: LayerItemHandlers;
}

export const ContainerLayerItem = ({
  layer, index, selectedIds, editingId, vectorEditingId, nodeEditMode, image, zoom, hideSelectionUi, gate, handlers,
}: ContainerLayerItemProps): React.ReactElement => {
  const sharedProps = {
    selectedIds,
    editingId,
    vectorEditingId,
    nodeEditMode,
    image,
    scale: zoom,
    zIndex: layerZIndex(index),
    hideSelectionUi,
    isSpacePressed: gate.isSpacePressed,
    isGrabMode: gate.isGrabMode,
    onSelect: handlers.onSelectLayer,
    onStartVectorEdit: handlers.onStartVectorEdit,
    onEndVectorEdit: handlers.onEndVectorEdit,
    onMoveDelta: (dx: number, dy: number) => handlers.onMoveDelta(layer.id, dx, dy),
    onMoveEnd: () => handlers.onMoveEnd(layer.id),
    onResizeDelta: (dir: Parameters<LayerItemHandlers["onResizeDelta"]>[1], dx: number, dy: number) =>
      handlers.onResizeDelta(layer.id, dir, dx, dy),
    onResizeEnd: () => handlers.onResizeEnd(layer.id),
    onStartEdit: handlers.onStartEdit,
    onEndEdit: handlers.onEndEdit,
    onCommitText: handlers.onCommitText,
    onLayerUpdate: handlers.onUpdateLayer,
    onContextMenu: (event: React.MouseEvent) => handlers.onLayerContextMenu(layer.id, event.clientX, event.clientY),
    onLayerContextMenu: handlers.onLayerContextMenu,
    onReparentCheck: handlers.onReparentCheck,
  };
  if (layer.type === "group") return <GroupLayerView layer={layer} {...sharedProps} />;
  return <FrameLayerView layer={layer} {...sharedProps} />;
};

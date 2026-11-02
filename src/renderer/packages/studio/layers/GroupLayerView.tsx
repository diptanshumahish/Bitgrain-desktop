import React from "react";
import type { GroupLayer } from "@bitgrain/studio-core/model/studio-types";
import { useLayerDrag } from "../hooks/useLayerDrag";
import { SelectionHandles } from "./SelectionHandles";
import { useGroupSelection } from "./use-group-selection";
import type { ContainerLayerViewProps } from "./container-layer-props";
import { containerLayerStyle } from "./container-layer-style";
import { ContainerLayerChildren } from "./ContainerLayerChildren";

interface GroupLayerViewProps extends ContainerLayerViewProps<GroupLayer> {
  onSelectSelf?: (multi?: boolean) => void;
  nested?: boolean;
}

export const GroupLayerView: React.FC<GroupLayerViewProps> = (props) => {
  const { layer, selectedIds, scale, zIndex, isSpacePressed, isGrabMode, hideSelectionUi, onSelect, onMoveDelta, onMoveEnd, onResizeDelta, onResizeEnd, onContextMenu, onLayerContextMenu, onSelectSelf, nested = false } = props;
  const selectSelf = (multi?: boolean): void => {
    if (onSelectSelf) onSelectSelf(multi);
    else onSelect(layer.id, multi);
  };
  const selection = useGroupSelection({
    layer,
    selectedIds,
    onSelect,
    onSelectSelf: (multi) => {
      if (nested) selectSelf(multi);
    },
    onSelfContextMenu: onContextMenu,
    onLayerContextMenu,
  });
  const { isSelected, hasSelectedDescendant, notePress } = selection;
  const isInteractive = !isSpacePressed && !isGrabMode;
  const drag = useLayerDrag({
    onMoveDelta,
    onMoveEnd,
    scale,
    selected: isSelected,
    onSelect: selectSelf,
    interactive: nested ? undefined : isInteractive,
  });
  const isDrilledIn = hasSelectedDescendant && !isSelected;

  const handlePointerDown = (e: React.PointerEvent): void => {
    notePress();
    if (isDrilledIn && isInteractive) {
      e.stopPropagation();
      return;
    }
    drag.onPointerDown(e);
  };

  const handleClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (!isSelected && (nested || isDrilledIn)) selectSelf(e.shiftKey);
  };

  const showChrome = isSelected && !hideSelectionUi;
  const style = { ...containerLayerStyle(layer, { zIndex, scale, isGrabMode, isSelected, showChrome, opacity: layer.opacity }), pointerEvents: "none" as const };

  return (
    <div
      style={style}
      onClick={handleClick}
      onDoubleClickCapture={(e) => { if (selection.drillIn(e.shiftKey)) e.stopPropagation(); }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu?.(e); }}
      onPointerDown={handlePointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
    >
      <ContainerLayerChildren view={props} selection={selection} bodyClassName="w-full h-full relative overflow-visible" />

      {showChrome && !isGrabMode && (
        <SelectionHandles
          scale={scale}
          boxWidth={layer.width}
          boxHeight={layer.height}
          onResizeDelta={onResizeDelta}
          onResizeEnd={onResizeEnd}
        />
      )}
    </div>
  );
};

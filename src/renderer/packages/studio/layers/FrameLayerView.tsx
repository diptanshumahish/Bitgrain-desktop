import React from "react";
import type { FrameLayer } from "@bitgrain/studio-core/model/studio-types";
import { useLayerDrag } from "../hooks/useLayerDrag";
import { SelectionHandles } from "./SelectionHandles";
import { useGroupSelection } from "./use-group-selection";
import { FrameEffectsBackdrop } from "./rich-paint/frame-effects-backdrop";
import { frameEffectShape, frameOwnsOpacity } from "@bitgrain/studio-core/shape-render/rich/frame-effect-shape";
import type { ContainerLayerViewProps } from "./container-layer-props";
import { containerLayerStyle } from "./container-layer-style";
import { ContainerLayerChildren } from "./ContainerLayerChildren";

export const FrameLayerView: React.FC<ContainerLayerViewProps<FrameLayer>> = (props) => {
  const { layer, selectedIds, scale, zIndex, isSpacePressed, isGrabMode, hideSelectionUi, onSelect, onMoveDelta, onMoveEnd, onResizeDelta, onResizeEnd, onContextMenu, onLayerContextMenu, onReparentCheck } = props;
  const isSelected = selectedIds.includes(layer.id);
  const drag = useLayerDrag({
    onMoveDelta,
    onMoveEnd: () => {
      onMoveEnd();
      onReparentCheck?.(layer.id);
    },
    scale,
    selected: isSelected,
    onSelect: (multi) => onSelect(layer.id, multi),
    interactive: !isSpacePressed && !isGrabMode,
  });

  const selection = useGroupSelection({
    layer,
    selectedIds,
    onSelect,
    onSelectSelf: () => undefined,
    onSelfContextMenu: onContextMenu,
    onLayerContextMenu,
  });

  const showChrome = isSelected && !hideSelectionUi;
  const ownsOpacity = frameOwnsOpacity(layer);
  const style = containerLayerStyle(layer, { zIndex, scale, isGrabMode, isSelected, showChrome, opacity: ownsOpacity ? undefined : layer.opacity });

  const bodyStyle: React.CSSProperties = {
    background: frameEffectShape(layer) ? "transparent" : layer.background,
    opacity: ownsOpacity ? layer.opacity : undefined,
    overflow: layer.clip === false ? "visible" : "hidden",
  };

  return (
    <div
      style={style}
      onClick={(e) => { e.stopPropagation(); }}
      onDoubleClickCapture={(e) => { if (selection.drillIn(e.shiftKey)) e.stopPropagation(); }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu?.(e); }}
      onPointerDown={(e) => { selection.notePress(); drag.onPointerDown(e); }}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
    >
      <FrameEffectsBackdrop layer={layer} scale={scale} opacity={layer.opacity} />
      <ContainerLayerChildren view={props} selection={selection} bodyClassName="w-full h-full relative" bodyStyle={bodyStyle} />

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

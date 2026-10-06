import React, { useRef, useCallback } from "react";
import type { FrameLayer, Layer } from "../../../data/studioTypes";
import type { NodeEditMode } from "../ui/NodeEditToolbar";
import { useLayerDrag } from "../hooks/useLayerDrag";
import { SelectionHandles, type HandleDir } from "./SelectionHandles";
import { applyResize } from "../../../utils/studio-layers";
import { LayerChildren } from "./layer-children";

interface FrameLayerViewProps {
  layer: FrameLayer;
  selectedIds: string[];
  editingId: string | null;
  vectorEditingId: string | null;
  nodeEditMode: NodeEditMode;
  image: string | null;
  scale: number;
  zIndex: number;
  isSpacePressed: boolean;
  isGrabMode: boolean;
  hideSelectionUi?: boolean;
  onSelect: (id: string, multi?: boolean) => void;
  onStartVectorEdit: (id: string) => void;
  onEndVectorEdit: () => void;
  onMoveDelta: (dx: number, dy: number) => void;
  onMoveEnd: () => void;
  onResizeDelta: (dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: () => void;
  onStartEdit: (id: string) => void;
  onEndEdit: (id: string, content: string, rich: string) => void;
  onCommitText: (id: string, content: string, rich: string) => void;
  onLayerUpdate: (id: string, updates: Partial<Layer>) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onReparentCheck?: (id: string) => void;
}

export const FrameLayerView: React.FC<FrameLayerViewProps> = ({
  layer,
  selectedIds,
  editingId,
  vectorEditingId,
  nodeEditMode,
  image,
  scale,
  zIndex,
  isSpacePressed,
  isGrabMode,
  hideSelectionUi,
  onSelect,
  onStartVectorEdit,
  onEndVectorEdit,
  onMoveDelta,
  onMoveEnd,
  onResizeDelta,
  onResizeEnd,
  onStartEdit,
  onEndEdit,
  onCommitText,
  onLayerUpdate,
  onContextMenu,
  onReparentCheck,
}) => {
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

  const lastChildClickRef = useRef<{ id: string; time: number } | null>(null);
  const selectChild = useCallback(
    (childId: string, multi?: boolean) => {
      const now = Date.now();
      const last = lastChildClickRef.current;
      const isDouble = !!last && last.id === childId && now - last.time < 350;
      lastChildClickRef.current = { id: childId, time: now };
      if (selectedIds.includes(childId)) return;
      onSelect(isDouble ? childId : layer.id, multi);
    },
    [onSelect, layer.id, selectedIds],
  );

  const runChildAction = useCallback(
    (childId: string, action: () => void) => {
      if (selectedIds.includes(childId)) action();
    },
    [selectedIds],
  );

  const showChrome = isSelected && !hideSelectionUi;
  const identity = (child: Layer): Layer => child;

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    left: layer.x,
    top: layer.y,
    width: layer.width,
    height: layer.height,
    zIndex,
    opacity: layer.opacity,
    display: "block",
    pointerEvents: "auto",
    cursor: isGrabMode ? "grab" : isSelected ? "move" : "default",
    outline: showChrome ? `${2 / scale}px solid var(--s-handle)` : "none",
    outlineOffset: 2 / scale,
    mixBlendMode: layer.blendMode as React.CSSProperties["mixBlendMode"],
    transform: `rotate(${layer.rotation ?? 0}deg) scaleX(${layer.flipH ? -1 : 1}) scaleY(${layer.flipV ? -1 : 1})`,
    transformOrigin: "center center",
  };

  const bodyStyle: React.CSSProperties = {
    background: layer.background,
    overflow: layer.clip === false ? "visible" : "hidden",
  };

  return (
    <div
      style={containerStyle}
      onClick={(e) => { e.stopPropagation(); }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu?.(e); }}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
    >
      <div className="w-full h-full relative" style={bodyStyle}>
        <LayerChildren
          layers={layer.layers}
          selectedIds={selectedIds}
          editingId={editingId}
          vectorEditingId={vectorEditingId}
          nodeEditMode={nodeEditMode}
          image={image}
          scale={scale}
          isSpacePressed={isSpacePressed}
          isGrabMode={isGrabMode}
          positioned={identity}
          onSelectChild={selectChild}
          runChildAction={runChildAction}
          onChildMove={(child, dx, dy) =>
            onLayerUpdate(child.id, { x: child.x + dx, y: child.y + dy })
          }
          onChildMoveEnd={onMoveEnd}
          onChildResize={(child, view, dir, dx, dy) =>
            onLayerUpdate(child.id, applyResize(view, dir, dx, dy))
          }
          onChildResizeEnd={onResizeEnd}
          onStartEdit={onStartEdit}
          onEndEdit={onEndEdit}
          onCommitText={onCommitText}
          onStartVectorEdit={onStartVectorEdit}
          onEndVectorEdit={onEndVectorEdit}
          onLayerUpdate={onLayerUpdate}
          onSelect={onSelect}
          onMoveDelta={onMoveDelta}
          onMoveEnd={onMoveEnd}
          onResizeDelta={onResizeDelta}
          onResizeEnd={onResizeEnd}
          onReparentCheck={onReparentCheck}
        />
      </div>

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

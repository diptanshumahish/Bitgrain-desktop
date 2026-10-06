import React, { useRef, useCallback } from "react";
import type { GroupLayer, Layer } from "../../../data/studioTypes";
import type { NodeEditMode } from "../ui/NodeEditToolbar";
import { useLayerDrag } from "../hooks/useLayerDrag";
import { SelectionHandles, type HandleDir } from "./SelectionHandles";
import { applyResize } from "../../../utils/studio-layers";
import { computeAutoLayout, applyFrame, type ChildFrame } from "../../../utils/auto-layout";
import { useGroupReorder } from "../hooks/use-group-reorder";
import { LayerChildren } from "./layer-children";

interface GroupLayerViewProps {
  layer: GroupLayer;
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

export const GroupLayerView: React.FC<GroupLayerViewProps> = ({
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
    onMoveEnd,
    scale,
    selected: isSelected,
    onSelect: (multi) => onSelect(layer.id, multi),
    interactive: !isSpacePressed && !isGrabMode,
  });

  // Single click selects the whole group; double click drills into the child under the cursor.
  // Once a child is drilled into, clicks keep it selected so it behaves like a normal layer
  // (a further double click runs its native action: vectorize, edit text, node edit).
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

  const frames = computeAutoLayout(layer);
  const isAutoLayout = frames !== null;
  const frameById = new Map<string, ChildFrame>((frames ?? []).map((frame) => [frame.id, frame]));
  const positioned = (child: Layer): Layer => applyFrame(child, frameById.get(child.id));
  const { dragReorder, handleMoveEnd } = useGroupReorder(layer, frames, onLayerUpdate, onMoveEnd);

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

  return (
    <div
      style={containerStyle}
      onClick={(e) => { e.stopPropagation(); }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu?.(e); }}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
    >
      <div className="w-full h-full relative overflow-visible">
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
          positioned={positioned}
          onSelectChild={selectChild}
          runChildAction={runChildAction}
          onChildMove={(child, dx, dy) => {
            if (isAutoLayout) {
              dragReorder(child.id, dx, dy);
              return;
            }
            onLayerUpdate(child.id, { x: child.x + dx, y: child.y + dy });
          }}
          onChildMoveEnd={handleMoveEnd}
          onChildResize={(child, view, dir, dx, dy) => {
            const next = applyResize(view, dir, dx, dy);
            onLayerUpdate(child.id, isAutoLayout ? { width: next.width, height: next.height } : next);
          }}
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

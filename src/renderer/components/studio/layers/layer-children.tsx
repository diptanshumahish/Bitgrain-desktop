import React from "react";
import type { GroupLayer, FrameLayer, Layer, ImageLayer } from "../../../data/studioTypes";
import type { NodeEditMode } from "../ui/NodeEditToolbar";
import { ImageLayerView } from "./ImageLayerView";
import { TextLayerView } from "./TextLayerView";
import { ShapeLayerView } from "./ShapeLayerView";
import { UploadLayerView } from "./UploadLayerView";
import { VectorLayerView } from "./VectorLayerView";
import { InkLayerView } from "./InkLayerView";
import { GroupLayerView } from "./GroupLayerView";
import { FrameLayerView } from "./FrameLayerView";
import { SelectionHandles, type HandleDir } from "./SelectionHandles";
import { SelectionBox } from "../canvas/selection-box";

const childSelectionTransform = (child: Layer): string | undefined => {
  const rotation = (child as { rotation?: number }).rotation ?? 0;
  const flipX = (child as { flipH?: boolean }).flipH ? -1 : 1;
  const flipY = (child as { flipV?: boolean }).flipV ? -1 : 1;
  if (!rotation && flipX === 1 && flipY === 1) return undefined;
  return `rotate(${rotation}deg) scaleX(${flipX}) scaleY(${flipY})`;
};

export interface LayerChildrenProps {
  layers: Layer[];
  selectedIds: string[];
  editingId: string | null;
  vectorEditingId: string | null;
  nodeEditMode: NodeEditMode;
  image: string | null;
  scale: number;
  isSpacePressed: boolean;
  isGrabMode: boolean;
  positioned: (child: Layer) => Layer;
  onSelectChild: (childId: string, multi?: boolean) => void;
  runChildAction: (childId: string, action: () => void) => void;
  onChildMove: (child: Layer, dx: number, dy: number) => void;
  onChildMoveEnd: () => void;
  onChildResize: (child: Layer, view: Layer, dir: HandleDir, dx: number, dy: number) => void;
  onChildResizeEnd: () => void;
  onStartEdit: (id: string) => void;
  onEndEdit: (id: string, content: string, rich: string) => void;
  onCommitText: (id: string, content: string, rich: string) => void;
  onStartVectorEdit: (id: string) => void;
  onEndVectorEdit: () => void;
  onLayerUpdate: (id: string, updates: Partial<Layer>) => void;
  onSelect: (id: string, multi?: boolean) => void;
  onMoveDelta: (dx: number, dy: number) => void;
  onMoveEnd: () => void;
  onResizeDelta: (dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: () => void;
  onReparentCheck?: (id: string) => void;
}

export const LayerChildren: React.FC<LayerChildrenProps> = ({
  layers,
  selectedIds,
  editingId,
  vectorEditingId,
  nodeEditMode,
  image,
  scale,
  isSpacePressed,
  isGrabMode,
  positioned,
  onSelectChild,
  runChildAction,
  onChildMove,
  onChildMoveEnd,
  onChildResize,
  onChildResizeEnd,
  onStartEdit,
  onEndEdit,
  onCommitText,
  onStartVectorEdit,
  onEndVectorEdit,
  onLayerUpdate,
  onSelect,
  onMoveDelta,
  onMoveEnd,
  onResizeDelta,
  onResizeEnd,
  onReparentCheck,
}) => (
  <>
    {layers.map((child, idx) => {
      const view = positioned(child);
      const commonProps = {
        scale,
        zIndex: idx + 1,
        hideSelectionUi: true,
        onSelect: (multi?: boolean) => onSelectChild(child.id, multi),
        onMoveDelta: (dx: number, dy: number) => onChildMove(child, dx, dy),
        onMoveEnd: onChildMoveEnd,
        onResizeDelta: (dir: HandleDir, dx: number, dy: number) =>
          onChildResize(child, view, dir, dx, dy),
        onResizeEnd: onChildResizeEnd,
      };

      if (child.type === "image") {
        return <ImageLayerView key={child.id} layer={view as ImageLayer} image={image} selected={selectedIds.includes(child.id)} {...commonProps} />;
      }
      if (child.type === "text") {
        return (
          <TextLayerView
            key={child.id}
            layer={view as typeof child}
            selected={selectedIds.includes(child.id)}
            editing={editingId === child.id}
            onStartEdit={() => onStartEdit(child.id)}
            onEndEdit={(content, rich) => onEndEdit(child.id, content, rich)}
            onCommitText={(content, rich) => onCommitText(child.id, content, rich)}
            {...commonProps}
          />
        );
      }
      if (child.type === "shape") {
        return (
          <ShapeLayerView
            key={child.id}
            layer={view as typeof child}
            selected={selectedIds.includes(child.id)}
            onDoubleClick={() => runChildAction(child.id, () => onStartVectorEdit(child.id))}
            {...commonProps}
          />
        );
      }
      if (child.type === "upload") {
        return <UploadLayerView key={child.id} layer={view as typeof child} selected={selectedIds.includes(child.id)} {...commonProps} />;
      }
      if (child.type === "vector") {
        return (
          <VectorLayerView
            key={child.id}
            layer={view as typeof child}
            selected={selectedIds.includes(child.id)}
            nodeEditing={vectorEditingId === child.id}
            nodeEditMode={nodeEditMode}
            onStartNodeEdit={() => runChildAction(child.id, () => onStartVectorEdit(child.id))}
            onEndNodeEdit={onEndVectorEdit}
            onUpdatePath={(path) => onLayerUpdate(child.id, { path })}
            {...commonProps}
          />
        );
      }
      if (child.type === "ink") {
        return <InkLayerView key={child.id} layer={view as typeof child} selected={selectedIds.includes(child.id)} {...commonProps} />;
      }
      if (child.type === "group") {
        return (
          <GroupLayerView
            key={child.id} layer={view as GroupLayer} selectedIds={selectedIds} editingId={editingId}
            vectorEditingId={vectorEditingId} nodeEditMode={nodeEditMode} image={image} scale={scale} zIndex={idx + 1}
            hideSelectionUi
            isSpacePressed={isSpacePressed} isGrabMode={isGrabMode} onSelect={onSelect}
            onStartVectorEdit={onStartVectorEdit} onEndVectorEdit={onEndVectorEdit}
            onMoveDelta={onMoveDelta} onMoveEnd={onMoveEnd}
            onResizeDelta={onResizeDelta} onResizeEnd={onResizeEnd}
            onStartEdit={onStartEdit} onEndEdit={onEndEdit} onCommitText={onCommitText}
            onLayerUpdate={(id, updates) => {
              const nested = (child as GroupLayer).layers.map((l) => (l.id === id ? { ...l, ...updates } : l));
              onLayerUpdate(child.id, { layers: nested } as Partial<Layer>);
            }}
          />
        );
      }
      if (child.type === "frame") {
        return (
          <FrameLayerView
            key={child.id} layer={view as FrameLayer} selectedIds={selectedIds} editingId={editingId}
            vectorEditingId={vectorEditingId} nodeEditMode={nodeEditMode} image={image} scale={scale} zIndex={idx + 1}
            hideSelectionUi
            isSpacePressed={isSpacePressed} isGrabMode={isGrabMode} onSelect={onSelect}
            onStartVectorEdit={onStartVectorEdit} onEndVectorEdit={onEndVectorEdit}
            onMoveDelta={(dx, dy) => onChildMove(child, dx, dy)}
            onMoveEnd={onChildMoveEnd}
            onResizeDelta={(dir, dx, dy) => onChildResize(child, view, dir, dx, dy)}
            onResizeEnd={onChildResizeEnd}
            onStartEdit={onStartEdit} onEndEdit={onEndEdit} onCommitText={onCommitText}
            onLayerUpdate={onLayerUpdate}
            onReparentCheck={onReparentCheck}
          />
        );
      }
      return null;
    })}

    {!isGrabMode &&
      layers.map((child) => {
        if (!selectedIds.includes(child.id)) return null;
        const view = positioned(child);
        return (
          <div
            key={`selframe-${child.id}`}
            className="absolute origin-center pointer-events-none"
            style={{
              left: view.x,
              top: view.y,
              width: view.width,
              height: view.height,
              zIndex: layers.length + 1,
              transform: childSelectionTransform(view),
            }}
          >
            <SelectionBox width={view.width} height={view.height} zoom={scale} />
            <SelectionHandles
              scale={scale}
              boxWidth={view.width}
              boxHeight={view.height}
              onResizeDelta={(dir, dx, dy) => onChildResize(child, view, dir, dx, dy)}
              onResizeEnd={onChildResizeEnd}
            />
          </div>
        );
      })}
  </>
);

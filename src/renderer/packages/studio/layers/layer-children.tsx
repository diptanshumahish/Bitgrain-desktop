import React from "react";
import type { GroupLayer, FrameLayer, Layer, ImageLayer } from "@bitgrain/studio-core/model/studio-types";
import type { NodeEditMode } from "../ui/NodeEditToolbar";
import { ImageLayerView } from "./ImageLayerView";
import { TextLayerView } from "./TextLayerView";
import { ShapeLayerView } from "./ShapeLayerView";
import { UploadLayerView } from "./UploadLayerView";
import { VectorLayerView } from "./VectorLayerView";
import { InkLayerView } from "./InkLayerView";
import { GroupLayerView } from "./GroupLayerView";
import { FrameLayerView } from "./FrameLayerView";
import { SelectionHandles } from "./SelectionHandles";
import { type HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import { SelectionBox } from "../canvas/selection-box";
import { MaskRunsView } from "./mask/mask-runs-view";

const childSelectionTransform = (child: Layer): string | undefined => {
  const rotation = (child as { rotation?: number }).rotation ?? 0;
  const flipX = (child as { flipH?: boolean }).flipH ? -1 : 1;
  const flipY = (child as { flipV?: boolean }).flipV ? -1 : 1;
  if (!rotation && flipX === 1 && flipY === 1) return undefined;
  return `rotate(${rotation}deg) scaleX(${flipX}) scaleY(${flipY})`;
};

interface LayerChildrenProps {
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
  isChildArmed: (childId: string) => boolean;
  onChildContextMenu: (childId: string, e: React.MouseEvent) => void;
  onLayerContextMenu?: (id: string, x: number, y: number) => void;
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
  isChildArmed,
  onChildContextMenu,
  onLayerContextMenu,
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
  onReparentCheck,
}) => {
  const renderChild = (child: Layer, idx: number): React.ReactNode => {
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
      onContextMenu: (e: React.MouseEvent) => onChildContextMenu(child.id, e),
    };
    const canEnterCrop = (): boolean => isChildArmed(child.id);

    if (child.type === "image") {
      return <ImageLayerView key={child.id} layer={view as ImageLayer} image={image} selected={selectedIds.includes(child.id)} onCropChange={(crop) => onLayerUpdate(child.id, { crop })} canEnterCrop={canEnterCrop} {...commonProps} />;
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
          onDoubleClick={() => isChildArmed(child.id) && onStartVectorEdit(child.id)}
          {...commonProps}
        />
      );
    }
    if (child.type === "upload") {
      return <UploadLayerView key={child.id} layer={view as typeof child} selected={selectedIds.includes(child.id)} onCropChange={(crop) => onLayerUpdate(child.id, { crop })} canEnterCrop={canEnterCrop} {...commonProps} />;
    }
    if (child.type === "vector") {
      return (
        <VectorLayerView
          key={child.id}
          layer={view as typeof child}
          selected={selectedIds.includes(child.id)}
          nodeEditing={vectorEditingId === child.id}
          nodeEditMode={nodeEditMode}
          onStartNodeEdit={() => isChildArmed(child.id) && onStartVectorEdit(child.id)}
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
          hideSelectionUi nested
          isSpacePressed={isSpacePressed} isGrabMode={isGrabMode} onSelect={onSelect}
          onSelectSelf={(multi) => onSelectChild(child.id, multi)}
          onContextMenu={(e) => onChildContextMenu(child.id, e)}
          onLayerContextMenu={onLayerContextMenu}
          onStartVectorEdit={onStartVectorEdit} onEndVectorEdit={onEndVectorEdit}
          onMoveDelta={(dx, dy) => onChildMove(child, dx, dy)}
          onMoveEnd={onChildMoveEnd}
          onResizeDelta={(dir, dx, dy) => onChildResize(child, view, dir, dx, dy)}
          onResizeEnd={onChildResizeEnd}
          onStartEdit={onStartEdit} onEndEdit={onEndEdit} onCommitText={onCommitText}
          onLayerUpdate={onLayerUpdate}
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
          onContextMenu={(e) => onChildContextMenu(child.id, e)}
          onStartVectorEdit={onStartVectorEdit} onEndVectorEdit={onEndVectorEdit}
          onMoveDelta={(dx, dy) => onChildMove(child, dx, dy)}
          onMoveEnd={onChildMoveEnd}
          onResizeDelta={(dir, dx, dy) => onChildResize(child, view, dir, dx, dy)}
          onResizeEnd={onChildResizeEnd}
          onStartEdit={onStartEdit} onEndEdit={onEndEdit} onCommitText={onCommitText}
          onLayerUpdate={onLayerUpdate}
          onLayerContextMenu={onLayerContextMenu}
          onReparentCheck={onReparentCheck}
        />
      );
    }
    return null;
  };

  return (
    <>
      <MaskRunsView
        layers={layers}
        scale={scale}
        pageImage={image}
        selectedIds={selectedIds}
        zIndexOf={(idx) => idx + 1}
        positioned={positioned}
        renderLayer={renderChild}
        renderChrome={() => null}
      />

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
};

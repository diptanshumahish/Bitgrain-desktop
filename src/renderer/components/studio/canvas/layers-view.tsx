import React from "react";
import type {
  Layer,
  ImageLayer,
  TextLayer,
  ShapeLayer,
  UploadLayer,
  GroupLayer,
  FrameLayer,
  VectorLayer,
  InkLayer,
  AdjustmentLayer,
} from "../../../data/studioTypes";
import { ImageLayerView } from "../layers/ImageLayerView";
import { TextLayerView } from "../layers/TextLayerView";
import { ShapeLayerView } from "../layers/ShapeLayerView";
import { UploadLayerView } from "../layers/UploadLayerView";
import { GroupLayerView } from "../layers/GroupLayerView";
import { FrameLayerView } from "../layers/FrameLayerView";
import { VectorLayerView } from "../layers/VectorLayerView";
import { InkLayerView } from "../layers/InkLayerView";
import { AdjustmentLayerView } from "../layers/AdjustmentLayerView";
import type { HandleDir } from "../layers/SelectionHandles";

interface LayersViewProps {
  layers: Layer[];
  selectedIds: string[];
  editingId: string | null;
  vectorEditingId: string | null;
  image: string | null;
  background: string;
  pageWidth: number;
  pageHeight: number;
  zoom: number;
  isSpacePressed: boolean;
  isGrabMode: boolean;
  hideSelectionUi?: boolean;
  onSelectLayer: (id: string | null, multi?: boolean) => void;
  onStartEdit: (id: string) => void;
  onEndEdit: (id: string, content: string, richContent: string) => void;
  onCommitText: (id: string, content: string, richContent: string) => void;
  onMoveDelta: (id: string, dx: number, dy: number) => void;
  onMoveEnd: (id: string) => void;
  onResizeDelta: (id: string, dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onStartVectorEdit: (id: string) => void;
  onEndVectorEdit: () => void;
  nodeEditMode: "move" | "bend";
  onLayerContextMenu: (id: string, x: number, y: number) => void;
  onReparentCheck?: (id: string) => void;
}

export const LayersView = ({
  layers,
  selectedIds,
  editingId,
  vectorEditingId,
  image,
  background,
  pageWidth,
  pageHeight,
  zoom,
  isSpacePressed,
  isGrabMode,
  hideSelectionUi,
  onSelectLayer,
  onStartEdit,
  onEndEdit,
  onCommitText,
  onMoveDelta,
  onMoveEnd,
  onResizeDelta,
  onResizeEnd,
  onUpdateLayer,
  onStartVectorEdit,
  onEndVectorEdit,
  nodeEditMode,
  onLayerContextMenu,
  onReparentCheck,
}: LayersViewProps): React.ReactElement => {
  return (
    <>
      {layers.map((layer, idx) => {
        if (!layer.visible) return null;
        const zIndex = (idx + 1) * 10;

        const commonProps = {
          scale: zoom,
          zIndex,
          hideSelectionUi,
          interactive: !isSpacePressed && !isGrabMode && !layer.locked,
          onSelect: (multi?: boolean) =>
            !isSpacePressed &&
            !isGrabMode &&
            !layer.locked &&
            onSelectLayer(layer.id, multi),
          onMoveDelta: (dx: number, dy: number) =>
            !layer.locked && onMoveDelta(layer.id, dx, dy),
          onMoveEnd: () => onMoveEnd(layer.id),
          onResizeDelta: (dir: HandleDir, dx: number, dy: number) =>
            !layer.locked && onResizeDelta(layer.id, dir, dx, dy),
          onResizeEnd: () => onResizeEnd(layer.id),
          onContextMenu: (e: React.MouseEvent) => onLayerContextMenu(layer.id, e.clientX, e.clientY),
        };

        if (layer.type === "image") {
          return (
            <ImageLayerView
              key={layer.id}
              layer={layer as ImageLayer}
              image={image}
              selected={selectedIds.includes(layer.id)}
              onCropChange={(crop) => onUpdateLayer(layer.id, { crop })}
              {...commonProps}
            />
          );
        }

        if (layer.type === "text") {
          return (
            <TextLayerView
              key={layer.id}
              layer={layer as TextLayer}
              selected={selectedIds.includes(layer.id)}
              editing={editingId === layer.id}
              onStartEdit={() =>
                !isSpacePressed &&
                !isGrabMode &&
                !layer.locked &&
                onStartEdit(layer.id)
              }
              onEndEdit={(content, rich) => onEndEdit(layer.id, content, rich)}
              onCommitText={(content, rich) => onCommitText(layer.id, content, rich)}
              {...commonProps}
            />
          );
        }

        if (layer.type === "shape") {
          return (
            <ShapeLayerView
              key={layer.id}
              layer={layer as ShapeLayer}
              selected={selectedIds.includes(layer.id)}
              onDoubleClick={() => !isSpacePressed && !isGrabMode && !layer.locked && onStartVectorEdit(layer.id)}
              {...commonProps}
            />
          );
        }

        if (layer.type === "upload") {
          return (
            <UploadLayerView
              key={layer.id}
              layer={layer as UploadLayer}
              selected={selectedIds.includes(layer.id)}
              onCropChange={(crop) => onUpdateLayer(layer.id, { crop })}
              {...commonProps}
            />
          );
        }

        if (layer.type === "group") {
          return (
            <GroupLayerView
              key={layer.id}
              layer={layer as GroupLayer}
              selectedIds={selectedIds}
              editingId={editingId}
              vectorEditingId={vectorEditingId}
              nodeEditMode={nodeEditMode}
              image={image}
              scale={zoom}
              zIndex={zIndex}
              hideSelectionUi={hideSelectionUi}
              isSpacePressed={isSpacePressed}
              isGrabMode={isGrabMode}
              onSelect={onSelectLayer}
              onStartVectorEdit={onStartVectorEdit}
              onEndVectorEdit={onEndVectorEdit}
              onMoveDelta={(dx, dy) => onMoveDelta(layer.id, dx, dy)}
              onMoveEnd={() => onMoveEnd(layer.id)}
              onResizeDelta={(dir, dx, dy) => onResizeDelta(layer.id, dir, dx, dy)}
              onResizeEnd={() => onResizeEnd(layer.id)}
              onStartEdit={onStartEdit}
              onEndEdit={onEndEdit}
              onCommitText={onCommitText}
              onLayerUpdate={onUpdateLayer}
              onContextMenu={(e) => onLayerContextMenu(layer.id, e.clientX, e.clientY)}
              onReparentCheck={onReparentCheck}
            />
          );
        }

        if (layer.type === "frame") {
          return (
            <FrameLayerView
              key={layer.id}
              layer={layer as FrameLayer}
              selectedIds={selectedIds}
              editingId={editingId}
              vectorEditingId={vectorEditingId}
              nodeEditMode={nodeEditMode}
              image={image}
              scale={zoom}
              zIndex={zIndex}
              hideSelectionUi={hideSelectionUi}
              isSpacePressed={isSpacePressed}
              isGrabMode={isGrabMode}
              onSelect={onSelectLayer}
              onStartVectorEdit={onStartVectorEdit}
              onEndVectorEdit={onEndVectorEdit}
              onMoveDelta={(dx, dy) => onMoveDelta(layer.id, dx, dy)}
              onMoveEnd={() => onMoveEnd(layer.id)}
              onResizeDelta={(dir, dx, dy) => onResizeDelta(layer.id, dir, dx, dy)}
              onResizeEnd={() => onResizeEnd(layer.id)}
              onStartEdit={onStartEdit}
              onEndEdit={onEndEdit}
              onCommitText={onCommitText}
              onLayerUpdate={onUpdateLayer}
              onContextMenu={(e) => onLayerContextMenu(layer.id, e.clientX, e.clientY)}
              onReparentCheck={onReparentCheck}
            />
          );
        }

        if (layer.type === "vector") {
          return (
            <VectorLayerView
              key={layer.id}
              layer={layer as VectorLayer}
              selected={selectedIds.includes(layer.id)}
              nodeEditing={vectorEditingId === layer.id}
              nodeEditMode={nodeEditMode}
              onStartNodeEdit={() => !isSpacePressed && !isGrabMode && !layer.locked && onStartVectorEdit(layer.id)}
              onEndNodeEdit={onEndVectorEdit}
              onUpdatePath={(path) => onUpdateLayer(layer.id, { path } as Partial<VectorLayer>)}
              {...commonProps}
            />
          );
        }

        if (layer.type === "ink") {
          return (
            <InkLayerView
              key={layer.id}
              layer={layer as InkLayer}
              selected={selectedIds.includes(layer.id)}
              {...commonProps}
            />
          );
        }

        if (layer.type === "adjustment") {
          return (
            <AdjustmentLayerView
              key={layer.id}
              layer={layer as AdjustmentLayer}
              belowLayers={layers.slice(0, idx)}
              background={background}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              image={image}
              selected={selectedIds.includes(layer.id)}
              {...commonProps}
            />
          );
        }

        return null;
      })}
    </>
  );
};

import React from "react";
import type { Layer } from "../../../data/studioTypes";
import { SelectionHandles, type HandleDir } from "../layers/SelectionHandles";
import { SelectionBox } from "./selection-box";

interface SelectionOverlayProps {
  layers: Layer[];
  selectedIds: string[];
  editingId: string | null;
  vectorEditingId: string | null;
  zoom: number;
  onResizeDelta: (id: string, dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: (id: string) => void;
  onRotate: (id: string, rotation: number) => void;
  onRotateEnd: (id: string) => void;
}

const getRotation = (layer: Layer): number =>
  (layer as { rotation?: number }).rotation ?? 0;

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  layers,
  selectedIds,
  editingId,
  vectorEditingId,
  zoom,
  onResizeDelta,
  onResizeEnd,
  onRotate,
  onRotateEnd,
}) => {
  const visible = layers.filter(
    (layer) =>
      selectedIds.includes(layer.id) &&
      layer.id !== vectorEditingId &&
      layer.id !== editingId,
  );

  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((layer) => {
        const rotation = getRotation(layer);
        const flipX = "flipH" in layer && layer.flipH ? -1 : 1;
        const flipY = "flipV" in layer && layer.flipV ? -1 : 1;
        return (
          <div
            key={layer.id}
            className="absolute origin-center pointer-events-none"
            style={{
              left: layer.x,
              top: layer.y,
              width: layer.width,
              height: layer.height,
              transform:
                rotation || flipX !== 1 || flipY !== 1
                  ? `rotate(${rotation}deg) scaleX(${flipX}) scaleY(${flipY})`
                  : undefined,
            }}
          >
            <SelectionBox
              width={layer.width}
              height={layer.height}
              zoom={zoom}
              showRotate
            />
            <SelectionHandles
              scale={zoom}
              boxWidth={layer.width}
              boxHeight={layer.height}
              rotation={rotation}
              onResizeDelta={(dir, dx, dy) =>
                onResizeDelta(layer.id, dir, dx, dy)
              }
              onResizeEnd={() => onResizeEnd(layer.id)}
              onRotate={(value) => onRotate(layer.id, value)}
              onRotateEnd={() => onRotateEnd(layer.id)}
            />
          </div>
        );
      })}
    </>
  );
};

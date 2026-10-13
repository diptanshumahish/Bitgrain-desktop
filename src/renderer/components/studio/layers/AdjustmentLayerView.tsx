import React from "react";
import type { AdjustmentLayer, Layer } from "../../../data/studioTypes";
import type { HandleDir } from "./SelectionHandles";
import { SelectionHandles } from "./SelectionHandles";
import { useLayerDrag } from "../hooks/useLayerDrag";
import { useAdjustmentPreview } from "../hooks/useAdjustmentPreview";
import { PIXELATE_MIN_SCALE } from "../canvas/canvas-transform";

interface AdjustmentLayerViewProps {
  layer: AdjustmentLayer;
  belowLayers: Layer[];
  background: string;
  pageWidth: number;
  pageHeight: number;
  image: string | null;
  selected: boolean;
  scale: number;
  zIndex?: number;
  hideSelectionUi?: boolean;
  interactive?: boolean;
  onSelect: (multi?: boolean) => void;
  onMoveDelta: (dx: number, dy: number) => void;
  onMoveEnd: () => void;
  onResizeDelta: (dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const AdjustmentLayerView: React.FC<AdjustmentLayerViewProps> = ({
  layer, belowLayers, background, pageWidth, pageHeight, image,
  selected, scale, zIndex, hideSelectionUi, interactive,
  onSelect, onMoveDelta, onMoveEnd, onResizeDelta, onResizeEnd, onContextMenu,
}) => {
  const drag = useLayerDrag({ onMoveDelta, onMoveEnd, scale, selected, onSelect, interactive });
  const showChrome = selected && !hideSelectionUi;
  const previewUrl = useAdjustmentPreview(
    belowLayers, background, image,
    layer.bitgrainEffect, layer.filters, layer.colorGrade,
    { x: layer.x, y: layer.y, width: layer.width, height: layer.height },
    pageWidth, pageHeight,
  );

  const outline = showChrome
    ? `${2 / scale}px solid var(--s-handle)`
    : previewUrl
      ? undefined
      : `${1 / scale}px dashed var(--s-handle)`;

  return (
    <div
      className="absolute origin-center"
      style={{
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.height,
        opacity: layer.opacity,
        zIndex,
        cursor: selected ? "move" : "default",
        outline,
        outlineOffset: 1 / scale,
        mixBlendMode: layer.blendMode as React.CSSProperties["mixBlendMode"],
      }}
      onClick={(e) => { e.stopPropagation(); if (!drag.directSelect) onSelect(e.shiftKey); }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu?.(e); }}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          draggable={false}
          className="w-full h-full block pointer-events-none"
          style={{ imageRendering: scale >= PIXELATE_MIN_SCALE ? "pixelated" : undefined }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center pointer-events-none text-[var(--s-text-subtle)]">
          <span className="text-[11px] font-editorial">Adjustment</span>
        </div>
      )}

      {showChrome && (
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

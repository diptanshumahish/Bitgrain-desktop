import React from "react";
import type { ShapeLayer } from "../../../data/studioTypes";
import type { HandleDir } from "./SelectionHandles";
import { SelectionHandles } from "./SelectionHandles";
import { useLayerDrag } from "../hooks/useLayerDrag";
import { quantizeRenderScale } from "../../../utils/render-scale";
import { ShapeSvgContent } from "./shape-svg-content";

interface ShapeLayerViewProps {
  layer: ShapeLayer;
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
  onDoubleClick?: () => void;
}

export const ShapeLayerView: React.FC<ShapeLayerViewProps> = ({
  layer, selected, scale, zIndex, hideSelectionUi, interactive,
  onSelect, onMoveDelta, onMoveEnd, onResizeDelta, onResizeEnd, onContextMenu, onDoubleClick,
}) => {
  const drag = useLayerDrag({ onMoveDelta, onMoveEnd, scale, selected, onSelect, interactive });
  const showChrome = selected && !hideSelectionUi;

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
        transform: `rotate(${layer.rotation}deg) scaleX(${layer.flipH ? -1 : 1}) scaleY(${layer.flipV ? -1 : 1})`,
        cursor: selected ? "move" : "default",
        outline: showChrome ? `${2 / scale}px solid var(--s-handle)` : undefined,
        outlineOffset: 1 / scale,
        mixBlendMode: layer.blendMode as React.CSSProperties["mixBlendMode"],
      }}
      onClick={(e) => { e.stopPropagation(); if (!drag.directSelect) onSelect(e.shiftKey); }}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick?.(); }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu?.(e); }}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
    >
      {(() => {
        const renderScale = quantizeRenderScale(scale);
        return (
          <svg
            viewBox={`0 0 ${layer.width} ${layer.height}`}
            preserveAspectRatio="none"
            width={layer.width * renderScale}
            height={layer.height * renderScale}
            shapeRendering="geometricPrecision"
            style={{
              display: "block",
              overflow: "visible",
              position: "absolute",
              top: 0,
              left: 0,
              transformOrigin: "top left",
              transform: `scale(${1 / renderScale})`,
            }}
          >
            <ShapeSvgContent layer={layer} width={layer.width} height={layer.height} />
          </svg>
        );
      })()}

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

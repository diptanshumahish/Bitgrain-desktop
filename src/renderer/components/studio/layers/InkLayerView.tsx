import React from "react";
import type { InkLayer } from "../../../data/studioTypes";
import type { HandleDir } from "./SelectionHandles";
import { useLayerDrag } from "../hooks/useLayerDrag";

const strokeReveal = (index: number, progress: number, total: number): number => {
  if (progress >= 100 || total === 0) return 1;
  const shown = (progress / 100) * total;
  const full = Math.floor(shown);
  if (index < full) return 1;
  if (index === full) return shown - full;
  return 0;
};

interface InkLayerViewProps {
  layer: InkLayer;
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

export const InkLayerView: React.FC<InkLayerViewProps> = ({
  layer,
  selected,
  scale,
  zIndex,
  interactive,
  onSelect,
  onMoveDelta,
  onMoveEnd,
  onContextMenu,
}) => {
  const drag = useLayerDrag({ onMoveDelta, onMoveEnd, scale, selected, onSelect, interactive });

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
        mixBlendMode: layer.blendMode as React.CSSProperties["mixBlendMode"],
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (!drag.directSelect) onSelect(event.shiftKey);
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onContextMenu?.(event);
      }}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
    >
      <svg
        viewBox={`0 0 ${layer.viewW} ${layer.viewH}`}
        preserveAspectRatio="none"
        width={layer.width}
        height={layer.height}
        shapeRendering="geometricPrecision"
        style={{
          display: "block",
          overflow: "visible",
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {layer.strokes.map((stroke, index) => {
          const opacity = strokeReveal(index, layer.drawProgress ?? 100, layer.strokes.length);
          if (opacity <= 0) return null;
          return <path key={index} d={stroke.d} fill={layer.color} fillOpacity={opacity} />;
        })}
      </svg>
    </div>
  );
};

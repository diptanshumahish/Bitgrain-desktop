import React, { useId } from "react";
import type { ShapeLayer } from "@bitgrain/studio-core/model/studio-types";
import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import { SelectionHandles } from "./SelectionHandles";
import { useLayerDrag } from "../hooks/useLayerDrag";
import { quantizeRenderScale } from "@bitgrain/core/image/render-scale";
import { ShapeSvgContent } from "./shape-svg-content";
import { GradientHandlesOverlay } from "../gradient-handles/gradient-handles-overlay";
import { hasRichPaint } from "@bitgrain/studio-core/shape-render/rich/has-rich-paint";
import { buildShapeRich } from "@bitgrain/studio-core/shape-render/rich/shape-rich";
import { svgSafeId } from "@bitgrain/studio-core/shape-render/svg-id";
import { RichLayerContent } from "./rich-paint/rich-layer-content";
import { richOwnsOpacity } from "@bitgrain/studio-core/shape-render/rich/rich-owns-opacity";

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
  const reactId = useId();
  const rich = hasRichPaint(layer) ? buildShapeRich(layer, `shp-${svgSafeId(reactId)}`) : null;
  const renderScale = quantizeRenderScale(scale);

  return (
    <div
      className="absolute origin-center pointer-events-auto"
      style={{
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.height,
        opacity: rich && richOwnsOpacity(rich) ? undefined : layer.opacity,
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
      {rich ? (
        <RichLayerContent rich={rich} renderScale={renderScale} opacity={layer.opacity} />
      ) : (
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
      )}

      {showChrome && layer.fillGradient && (
        <GradientHandlesOverlay layerId={layer.id} gradient={layer.fillGradient} width={layer.width} height={layer.height} scale={scale} />
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

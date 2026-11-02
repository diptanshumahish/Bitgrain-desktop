import React, { useId } from "react";
import type { VectorLayer, VectorPath, VectorFillFit } from "@bitgrain/studio-core/model/studio-types";
import type { NodeEditMode } from "../ui/NodeEditToolbar";
import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import { useLayerDrag } from "../hooks/useLayerDrag";
import { vectorPathToD } from "@bitgrain/studio-core/geometry/vector-utils";
import { VectorNodeEditor } from "./VectorNodeEditor";
import { quantizeRenderScale } from "@bitgrain/core/image/render-scale";
import { vectorDashArray, vectorPaint } from "@bitgrain/studio-core/shape-render/vector-paint";
import { SvgNodes } from "@bitgrain/studio-core/shape-render/svg-node/svg-node-react";
import { svgSafeId } from "@bitgrain/studio-core/shape-render/svg-id";
import { GradientHandlesOverlay } from "../gradient-handles/gradient-handles-overlay";
import { hasRichPaint } from "@bitgrain/studio-core/shape-render/rich/has-rich-paint";
import { buildVectorRich } from "@bitgrain/studio-core/shape-render/rich/vector-rich";
import { RichLayerContent } from "./rich-paint/rich-layer-content";
import { richOwnsOpacity } from "@bitgrain/studio-core/shape-render/rich/rich-owns-opacity";

const HIT_SLOP_SCREEN_PX = 10;
const VIEW_BOX = { width: 100, height: 100 };

const fitToAspectRatio = (fit: VectorFillFit): string => {
  if (fit === "stretch") return "none";
  if (fit === "cover") return "xMidYMid slice";
  return "xMidYMid meet";
};

interface VectorLayerViewProps {
  layer: VectorLayer;
  selected: boolean;
  nodeEditing: boolean;
  nodeEditMode: NodeEditMode;
  scale: number;
  zIndex?: number;
  hideSelectionUi?: boolean;
  interactive?: boolean;
  onSelect: (multi?: boolean) => void;
  onStartNodeEdit: () => void;
  onEndNodeEdit: () => void;
  onMoveDelta: (dx: number, dy: number) => void;
  onMoveEnd: () => void;
  onResizeDelta: (dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: () => void;
  onUpdatePath: (path: VectorPath) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const VectorLayerView: React.FC<VectorLayerViewProps> = ({
  layer,
  selected,
  nodeEditing,
  nodeEditMode,
  scale,
  zIndex,
  interactive,
  onSelect,
  onStartNodeEdit,
  onMoveDelta,
  onMoveEnd,
  onUpdatePath,
  onContextMenu,
}) => {
  const showAnchors = nodeEditing;
  const drag = useLayerDrag({ onMoveDelta, onMoveEnd, scale, selected, onSelect, interactive, blocked: nodeEditing });
  const fillImage = layer.fillImage;
  const patternId = `vfill-${layer.id}`;
  const reactId = useId();
  const pathD = vectorPathToD(layer.path);
  const paint = vectorPaint({
    layer,
    d: pathD,
    idBase: `vec-${svgSafeId(reactId)}`,
    userBox: VIEW_BOX,
    pixelBox: { width: layer.width, height: layer.height },
  });
  const pathFill = !layer.path.closed ? "none" : fillImage ? `url(#${patternId})` : paint.gradientFill ?? layer.fill;
  const renderScale = quantizeRenderScale(scale);
  const renderStrokeWidth = layer.strokeWidth * renderScale;
  const dashArray = vectorDashArray(layer, renderStrokeWidth, renderScale);
  const reveal = Math.max(0, Math.min(1, (layer.drawProgress ?? 100) / 100));
  const revealing = reveal < 1;
  const split = paint.alignment.split;
  const hitStrokeWidth = Math.max(renderStrokeWidth, (HIT_SLOP_SCREEN_PX / scale) * renderScale);
  const pathCursor = selected ? "move" : "pointer";
  const rich = hasRichPaint(layer) ? buildVectorRich(layer, `vecr-${svgSafeId(reactId)}`) : null;

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onStartNodeEdit();
  };

  return (
    <div
      className="absolute origin-center"
      style={{
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.height,
        opacity: rich && richOwnsOpacity(rich) ? undefined : layer.opacity,
        zIndex,
        transform: `rotate(${layer.rotation}deg) scaleX(${layer.flipH ? -1 : 1}) scaleY(${layer.flipV ? -1 : 1})`,
        pointerEvents: nodeEditing ? "auto" : "none",
        mixBlendMode: layer.blendMode as React.CSSProperties["mixBlendMode"],
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (nodeEditing) return;
        if (!drag.directSelect) onSelect(event.shiftKey);
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onContextMenu?.(event);
      }}
      onDoubleClick={handleDoubleClick}
      onPointerDown={(event) => {
        if (nodeEditing) {
          event.stopPropagation();
          return;
        }
        drag.onPointerDown(event);
      }}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
    >
      {rich && <RichLayerContent rich={rich} renderScale={renderScale} opacity={layer.opacity} />}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        width={layer.width * renderScale}
        height={layer.height * renderScale}
        shapeRendering="geometricPrecision"
        style={{
          display: "block",
          overflow: "visible",
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          left: 0,
          transformOrigin: "top left",
          transform: `scale(${1 / renderScale})`,
        }}
      >
        {paint.defs.length > 0 && (
          <defs>
            <SvgNodes nodes={paint.defs} />
          </defs>
        )}
        {fillImage && (
          <defs>
            <pattern
              id={patternId}
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <image
                href={fillImage.src}
                x="0"
                y="0"
                width="100"
                height="100"
                preserveAspectRatio={fitToAspectRatio(fillImage.fit)}
              />
            </pattern>
          </defs>
        )}
        <path
          d={pathD}
          fill="none"
          stroke="transparent"
          strokeWidth={hitStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          pointerEvents={nodeEditing ? "none" : "stroke"}
          cursor={pathCursor}
        />
        {split && !rich && (
          <path
            d={pathD}
            pointerEvents={nodeEditing ? "none" : "visiblePainted"}
            cursor={pathCursor}
            fill={pathFill}
            fillOpacity={revealing ? reveal : undefined}
            stroke="none"
          />
        )}
        <path
          d={pathD}
          pointerEvents={nodeEditing ? "none" : "visiblePainted"}
          cursor={pathCursor}
          opacity={rich ? 0 : undefined}
          fill={split ? "none" : pathFill}
          fillOpacity={revealing ? reveal : undefined}
          stroke={layer.strokeColor}
          strokeWidth={renderStrokeWidth * paint.alignment.widthFactor}
          clipPath={paint.alignment.attrs.clipPath as string | undefined}
          mask={paint.alignment.attrs.mask as string | undefined}
          strokeLinecap={layer.lineCap}
          strokeLinejoin={layer.lineJoin}
          strokeDasharray={revealing ? "1 1" : dashArray}
          strokeDashoffset={revealing ? 1 - reveal : undefined}
          pathLength={revealing ? 1 : undefined}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {selected && !nodeEditing && layer.fillGradient && layer.path.closed && !fillImage && (
        <GradientHandlesOverlay layerId={layer.id} gradient={layer.fillGradient} width={layer.width} height={layer.height} scale={scale} />
      )}

      {showAnchors && (
        <VectorNodeEditor
          layer={layer}
          scale={scale}
          mode={nodeEditMode}
          onUpdatePath={onUpdatePath}
        />
      )}
    </div>
  );
};

import React from "react";
import type { VectorLayer, VectorPath, VectorFillFit } from "../../../data/studioTypes";
import type { NodeEditMode } from "../ui/NodeEditToolbar";
import type { HandleDir } from "./SelectionHandles";
import { useLayerDrag } from "../hooks/useLayerDrag";
import { vectorPathToD, dashArrayFor } from "../../../utils/vector-utils";
import { VectorNodeEditor } from "./VectorNodeEditor";

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
  const pathFill = !layer.path.closed ? "none" : fillImage ? `url(#${patternId})` : layer.fill;
  const dashArray = dashArrayFor(layer.dashStyle, layer.strokeWidth);
  const reveal = Math.max(0, Math.min(1, (layer.drawProgress ?? 100) / 100));
  const revealing = reveal < 1;

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
        opacity: layer.opacity,
        zIndex,
        transform: `rotate(${layer.rotation}deg) scaleX(${layer.flipH ? -1 : 1}) scaleY(${layer.flipV ? -1 : 1})`,
        cursor: selected ? "move" : "default",
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
      <svg
        viewBox="0 0 100 100"
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
          d={vectorPathToD(layer.path)}
          fill={pathFill}
          fillOpacity={revealing ? reveal : undefined}
          stroke={layer.strokeColor}
          strokeWidth={layer.strokeWidth}
          strokeLinecap={layer.lineCap}
          strokeLinejoin={layer.lineJoin}
          strokeDasharray={revealing ? "1 1" : dashArray}
          strokeDashoffset={revealing ? 1 - reveal : undefined}
          pathLength={revealing ? 1 : undefined}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

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

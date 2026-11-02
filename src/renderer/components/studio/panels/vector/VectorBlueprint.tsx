import React from "react";
import type { VectorLayer } from "../../../../data/studioTypes";
import { anchorsToPath } from "../../../../utils/vector-utils";
import { curvedHandles, scaleAnchors } from "./vector-blueprint-geometry";

interface VectorBlueprintProps {
  layer: VectorLayer;
}

const DRAWING_PX = 76;
const ANCHOR_PX = 4.5;
const HANDLE_DOT_PX = 2.2;
const FILL_OPACITY = 0.35;

export const VectorBlueprint: React.FC<VectorBlueprintProps> = ({ layer }) => {
  const width = Math.max(1, layer.width);
  const height = Math.max(1, layer.height);
  const unitPerPx = Math.max(width, height) / DRAWING_PX;
  const anchors = scaleAnchors(layer.path.anchors, width, height);
  const anchorSize = ANCHOR_PX * unitPerPx;
  const fill = layer.fill && layer.fill !== "transparent" ? layer.fill : "none";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-[76px] h-[76px] overflow-visible"
      aria-hidden="true"
    >
      <path
        d={anchorsToPath(anchors, layer.path.closed)}
        fill={fill}
        fillOpacity={FILL_OPACITY}
        className="stroke-[var(--s-text)]"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      {anchors.flatMap((anchor, index) =>
        curvedHandles(anchor).map((handle, handleIndex) => (
          <g key={`handle-${index}-${handleIndex}`} className="text-[var(--s-canvas-selection)]">
            <path
              d={`M${anchor.x} ${anchor.y} L${handle.x} ${handle.y}`}
              className="stroke-current"
              strokeWidth={0.8}
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={handle.x} cy={handle.y} r={HANDLE_DOT_PX * unitPerPx} className="fill-current" />
          </g>
        )),
      )}
      {anchors.map((anchor, index) => (
        <rect
          key={`anchor-${index}`}
          x={anchor.x - anchorSize / 2}
          y={anchor.y - anchorSize / 2}
          width={anchorSize}
          height={anchorSize}
          fill="white"
          className="stroke-[var(--s-canvas-selection)]"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
};

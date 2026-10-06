import React from "react";
import type { BezierAnchor } from "../../../data/studioTypes";
import { DRAG_NODE_CURSOR } from "./vector-cursors";

interface VectorAnchorMarkerProps {
  anchor: BezierAnchor;
  index: number;
  scale: number;
  px: (n: number) => number;
  py: (n: number) => number;
  selected: boolean;
  hovered: boolean;
  showHandles: boolean;
  onHover: (idx: number | null) => void;
  onAnchorPointerDown: (event: React.PointerEvent, idx: number) => void;
  onAnchorClick: (event: React.MouseEvent, idx: number) => void;
  onAnchorDoubleClick: (event: React.MouseEvent, idx: number) => void;
  onHandlePointerDown: (
    event: React.PointerEvent,
    idx: number,
    side: "inHandle" | "outHandle",
  ) => void;
}

const ANCHOR_SCREEN_RADIUS = 4;
const ANCHOR_HIT_RADIUS = 9;
const HANDLE_SCREEN_RADIUS = 3;
const ANCHOR_STROKE = 1.25;
const HANDLE_STROKE = 1;
const LINK_STROKE = 0.75;

export const VectorAnchorMarker: React.FC<VectorAnchorMarkerProps> = ({
  anchor,
  index,
  scale,
  px,
  py,
  selected,
  hovered,
  showHandles,
  onHover,
  onAnchorPointerDown,
  onAnchorClick,
  onAnchorDoubleClick,
  onHandlePointerDown,
}) => {
  const ax = px(anchor.x);
  const ay = py(anchor.y);
  const hasOut = !!anchor.outHandle;
  const hasIn = !!anchor.inHandle;
  const outPos = hasOut
    ? { x: px(anchor.outHandle!.x), y: py(anchor.outHandle!.y) }
    : { x: ax, y: ay };
  const inPos = hasIn
    ? { x: px(anchor.inHandle!.x), y: py(anchor.inHandle!.y) }
    : { x: ax, y: ay };
  const isCorner = anchor.cornerType === "corner" || (!hasIn && !hasOut);

  const r = ANCHOR_SCREEN_RADIUS / scale;
  const hr = HANDLE_SCREEN_RADIUS / scale;
  const anchorStroke = ANCHOR_STROKE / scale;
  const handleStroke = HANDLE_STROKE / scale;
  const linkStroke = LINK_STROKE / scale;

  const diamond = (cx: number, cy: number, half: number) =>
    `${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}`;

  return (
    <g
      onPointerEnter={() => onHover(index)}
      onPointerLeave={() => onHover(null)}
      shapeRendering="geometricPrecision"
    >
      <circle
        cx={ax}
        cy={ay}
        r={ANCHOR_HIT_RADIUS / scale}
        fill="transparent"
        className="[pointer-events:all]"
        style={{ cursor: DRAG_NODE_CURSOR }}
        onPointerDown={(event) => onAnchorPointerDown(event, index)}
        onClick={(event) => onAnchorClick(event, index)}
        onDoubleClick={(event) => onAnchorDoubleClick(event, index)}
      />
      {hovered && (
        <circle
          cx={ax}
          cy={ay}
          r={(ANCHOR_SCREEN_RADIUS + 3) / scale}
          fill="none"
          stroke="var(--s-accent)"
          strokeWidth={1.25 / scale}
          opacity={0.7}
          className="pointer-events-none"
        />
      )}
      {showHandles && (
        <>
          <line x1={ax} y1={ay} x2={outPos.x} y2={outPos.y}
            stroke="var(--s-handle)" strokeWidth={linkStroke}
            opacity={hasOut ? 0.85 : 0.35}
            className="pointer-events-none" />
          <polygon
            points={diamond(outPos.x, outPos.y, hr)}
            fill={hasOut ? "var(--s-handle)" : "white"}
            stroke="var(--s-handle)" strokeWidth={handleStroke}
            className="cursor-grab [pointer-events:all]"
            onPointerDown={(event) => onHandlePointerDown(event, index, "outHandle")} />
          <line x1={ax} y1={ay} x2={inPos.x} y2={inPos.y}
            stroke="var(--s-handle)" strokeWidth={linkStroke}
            opacity={hasIn ? 0.85 : 0.35}
            className="pointer-events-none" />
          <polygon
            points={diamond(inPos.x, inPos.y, hr)}
            fill={hasIn ? "var(--s-handle)" : "white"}
            stroke="var(--s-handle)" strokeWidth={handleStroke}
            className="cursor-grab [pointer-events:all]"
            onPointerDown={(event) => onHandlePointerDown(event, index, "inHandle")} />
        </>
      )}
      {isCorner ? (
        <rect
          x={ax - r}
          y={ay - r}
          width={r * 2}
          height={r * 2}
          fill={selected || hovered ? "var(--s-accent)" : "white"}
          stroke="var(--s-accent)"
          strokeWidth={anchorStroke}
          className="pointer-events-none"
        />
      ) : (
        <circle
          cx={ax}
          cy={ay}
          r={r}
          fill={selected || hovered ? "var(--s-accent)" : "white"}
          stroke="var(--s-accent)"
          strokeWidth={anchorStroke}
          className="pointer-events-none"
        />
      )}
    </g>
  );
};

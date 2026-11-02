import React from "react";
import type { CurveChannel, CurvePoint } from "../../engine/grade-types";
import { buildCurvePath, CURVE_VIEW_SIZE } from "./curve-points";
import { useCurveDrag } from "./use-curve-drag";

interface CurveEditorProps {
  channel: CurveChannel;
  points: CurvePoint[];
  onChange: (points: CurvePoint[]) => void;
  onCommit?: () => void;
}

const CHANNEL_STROKE: Record<CurveChannel, string> = {
  master: "stroke-[var(--s-text)]",
  red: "stroke-[#e5484d]",
  green: "stroke-[#30a46c]",
  blue: "stroke-[#3e63dd]",
};

const GRID_LINES = [25, 50, 75];
const POINT_RADIUS = 2.6;

export const CurveEditor: React.FC<CurveEditorProps> = ({ channel, points, onChange, onCommit }) => {
  const drag = useCurveDrag({ points, onChange, onCommit });

  return (
    <svg
      ref={drag.svgRef}
      viewBox={`0 0 ${CURVE_VIEW_SIZE} ${CURVE_VIEW_SIZE}`}
      className="w-full aspect-square rounded-lg bg-[var(--s-bg-input)] touch-none cursor-crosshair"
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onDoubleClick={drag.onDoubleClick}
    >
      {GRID_LINES.map((line) => (
        <g key={line} className="stroke-[var(--s-border)]" strokeWidth={0.4}>
          <line x1={line} y1={0} x2={line} y2={CURVE_VIEW_SIZE} />
          <line x1={0} y1={line} x2={CURVE_VIEW_SIZE} y2={line} />
        </g>
      ))}
      <line
        x1={0}
        y1={CURVE_VIEW_SIZE}
        x2={CURVE_VIEW_SIZE}
        y2={0}
        className="stroke-[var(--s-text-subtle)]"
        strokeWidth={0.4}
        strokeDasharray="2 2"
      />
      <path d={buildCurvePath(points)} fill="none" className={CHANNEL_STROKE[channel]} strokeWidth={1.4} />
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x * CURVE_VIEW_SIZE}
          cy={(1 - point.y) * CURVE_VIEW_SIZE}
          r={POINT_RADIUS}
          className={`fill-[var(--s-bg-panel)] ${CHANNEL_STROKE[channel]}`}
          strokeWidth={1.2}
        />
      ))}
    </svg>
  );
};

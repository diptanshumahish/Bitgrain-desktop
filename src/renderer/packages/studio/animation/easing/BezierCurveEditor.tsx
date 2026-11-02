import React, { useRef } from "react";
import type { BezierCurve } from "@bitgrain/studio-core/model/animation-types";
import {
  CURVE_VIEW_HEIGHT,
  CURVE_VIEW_WIDTH,
  curvePath,
  fromView,
  holdPath,
  roundCurveValue,
  toView,
} from "./curve-geometry";

type HandleIndex = 0 | 1;

interface BezierCurveEditorProps {
  curve: BezierCurve | null;
  onChange: (curve: BezierCurve) => void;
  onCommit: (curve: BezierCurve) => void;
}

const HANDLE_RADIUS = 5;
const HANDLES: readonly HandleIndex[] = [0, 1];

const withHandle = (curve: BezierCurve, handle: HandleIndex, x: number, y: number): BezierCurve => {
  const next: BezierCurve = [...curve];
  next[handle * 2] = roundCurveValue(x);
  next[handle * 2 + 1] = roundCurveValue(y);
  return next;
};

const anchorFor = (handle: HandleIndex): { x: number; y: number } => (handle === 0 ? toView(0, 0) : toView(1, 1));

export const BezierCurveEditor: React.FC<BezierCurveEditorProps> = ({ curve, onChange, onCommit }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<HandleIndex | null>(null);
  const latestRef = useRef<BezierCurve | null>(curve);

  const pointFromEvent = (event: React.PointerEvent): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const viewX = ((event.clientX - rect.left) / rect.width) * CURVE_VIEW_WIDTH;
    const viewY = ((event.clientY - rect.top) / rect.height) * CURVE_VIEW_HEIGHT;
    return fromView(viewX, viewY);
  };

  const handlePointerDown = (handle: HandleIndex, event: React.PointerEvent<SVGCircleElement>): void => {
    event.stopPropagation();
    dragRef.current = handle;
    latestRef.current = curve;
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>): void => {
    const handle = dragRef.current;
    const base = latestRef.current;
    const point = pointFromEvent(event);
    if (handle === null || !base || !point) return;
    const next = withHandle(base, handle, point.x, point.y);
    latestRef.current = next;
    onChange(next);
  };

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>): void => {
    if (dragRef.current === null) return;
    dragRef.current = null;
    svgRef.current?.releasePointerCapture(event.pointerId);
    if (latestRef.current) onCommit(latestRef.current);
  };

  const unitStart = toView(0, 1);
  const unitEnd = toView(1, 0);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${CURVE_VIEW_WIDTH} ${CURVE_VIEW_HEIGHT}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="w-full h-auto block touch-none select-none"
    >
      <rect
        x={unitStart.x}
        y={unitStart.y}
        width={unitEnd.x - unitStart.x}
        height={unitEnd.y - unitStart.y}
        className="fill-[var(--s-bg-input)] stroke-[var(--s-border)]"
      />
      <path d={curve ? curvePath(curve) : holdPath()} fill="none" strokeWidth={2} className="stroke-[var(--s-text)]" />
      {curve &&
        HANDLES.map((handle) => {
          const anchor = anchorFor(handle);
          const point = toView(curve[handle * 2], curve[handle * 2 + 1]);
          return (
            <g key={handle}>
              <line x1={anchor.x} y1={anchor.y} x2={point.x} y2={point.y} strokeWidth={1} className="stroke-[var(--s-text-subtle)]" />
              <circle
                cx={point.x}
                cy={point.y}
                r={HANDLE_RADIUS}
                onPointerDown={(event) => handlePointerDown(handle, event)}
                className="fill-[var(--s-accent)] stroke-[var(--s-bg-panel)] cursor-grab"
              />
            </g>
          );
        })}
    </svg>
  );
};

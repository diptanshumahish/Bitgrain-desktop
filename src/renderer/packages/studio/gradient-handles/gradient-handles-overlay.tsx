import React, { useRef } from "react";
import type { GradientPoint, PaintGradient } from "@bitgrain/studio-core/model/paint-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { gradientAxes } from "@bitgrain/studio-core/shape-render/paint/gradient-matrix";
import { gradientEditSignal } from "./gradient-edit-store";
import { draggedGradient, type GradientHandleKind, type HandleDrag } from "./gradient-handle-math";
import { GradientHandleDot } from "./gradient-handle-dot";

const GUIDE_STROKE_PX = 1;
const GUIDE_HALO_FACTOR = 2;
const GUIDE_DASH_PX = 4;
const GUIDE_GAP_PX = 3;

interface GradientHandlesOverlayProps {
  layerId: string;
  gradient: PaintGradient;
  width: number;
  height: number;
  scale: number;
}

const toLocalPoint = (svg: SVGSVGElement, clientX: number, clientY: number): GradientPoint => {
  const matrix = svg.getScreenCTM();
  if (!matrix) return { x: clientX, y: clientY };
  const local = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
  return { x: local.x, y: local.y };
};

export const GradientHandlesOverlay: React.FC<GradientHandlesOverlayProps> = ({ layerId, gradient, width, height, scale }) => {
  const target = useSignalValue(gradientEditSignal);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<Omit<HandleDrag, "pointer"> | null>(null);
  const box = { width, height };
  const axes = gradientAxes(gradient, box);
  if (!target || target.layerId !== layerId || !axes) return null;

  const beginDrag = (kind: GradientHandleKind, event: React.PointerEvent<SVGCircleElement>): void => {
    if (!svgRef.current) return;
    event.stopPropagation();
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { kind, initial: gradient, pointerStart: toLocalPoint(svgRef.current, event.clientX, event.clientY), box };
  };

  const moveDrag = (event: React.PointerEvent<SVGSVGElement>): void => {
    if (!dragRef.current || !svgRef.current) return;
    event.stopPropagation();
    const pointer = toLocalPoint(svgRef.current, event.clientX, event.clientY);
    target.apply(draggedGradient({ ...dragRef.current, pointer }));
  };

  const endDrag = (): void => {
    dragRef.current = null;
  };

  const origin = axes.origin;
  const end = { x: origin.x + axes.major.x, y: origin.y + axes.major.y };
  const minor = { x: origin.x + axes.minor.x, y: origin.y + axes.minor.y };
  const showMinor = gradient.kind !== "linear";

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="absolute inset-0 overflow-visible pointer-events-none z-10"
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={(event) => event.stopPropagation()}
    >
      <line x1={origin.x} y1={origin.y} x2={end.x} y2={end.y} stroke="#ffffff" strokeWidth={(GUIDE_STROKE_PX * GUIDE_HALO_FACTOR) / scale} />
      <line x1={origin.x} y1={origin.y} x2={end.x} y2={end.y} stroke="#141414" strokeWidth={GUIDE_STROKE_PX / scale} />
      {showMinor && (
        <line x1={origin.x} y1={origin.y} x2={minor.x} y2={minor.y} stroke="#141414" strokeWidth={GUIDE_STROKE_PX / scale} strokeDasharray={`${GUIDE_DASH_PX / scale} ${GUIDE_GAP_PX / scale}`} />
      )}
      <GradientHandleDot kind="start" point={origin} scale={scale} onPointerDown={beginDrag} />
      <GradientHandleDot kind="end" point={end} scale={scale} onPointerDown={beginDrag} />
      {showMinor && <GradientHandleDot kind="minor" point={minor} scale={scale} onPointerDown={beginDrag} />}
    </svg>
  );
};

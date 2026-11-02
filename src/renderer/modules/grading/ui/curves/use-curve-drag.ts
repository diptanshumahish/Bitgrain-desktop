import { useRef } from "react";
import type { CurvePoint } from "../../engine/grade-types";
import { findNearestPoint, insertPoint, MAX_CURVE_POINTS, movePoint, removePoint } from "./curve-points";

interface CurveDragArgs {
  points: CurvePoint[];
  onChange: (points: CurvePoint[]) => void;
  onCommit?: () => void;
}

interface CurveDragHandlers {
  svgRef: React.RefObject<SVGSVGElement | null>;
  onPointerDown: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerMove: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerUp: (event: React.PointerEvent<SVGSVGElement>) => void;
  onDoubleClick: (event: React.MouseEvent<SVGSVGElement>) => void;
}

const clampUnit = (value: number): number => Math.min(1, Math.max(0, value));

export const useCurveDrag = ({ points, onChange, onCommit }: CurveDragArgs): CurveDragHandlers => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const workingRef = useRef<CurvePoint[]>(points);

  const toUnit = (clientX: number, clientY: number): CurvePoint | null => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return null;
    return { x: clampUnit((clientX - rect.left) / rect.width), y: clampUnit(1 - (clientY - rect.top) / rect.height) };
  };

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>): void => {
    const target = toUnit(event.clientX, event.clientY);
    if (!target) return;
    const nearest = findNearestPoint(points, target);
    if (nearest === null && points.length >= MAX_CURVE_POINTS) return;
    const inserted = nearest === null ? insertPoint(points, target) : { points, index: nearest };
    workingRef.current = inserted.points;
    dragIndexRef.current = inserted.index;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (nearest === null) onChange(inserted.points);
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>): void => {
    const index = dragIndexRef.current;
    const target = toUnit(event.clientX, event.clientY);
    if (index === null || !target) return;
    workingRef.current = movePoint(workingRef.current, index, target);
    onChange(workingRef.current);
  };

  const onPointerUp = (event: React.PointerEvent<SVGSVGElement>): void => {
    if (dragIndexRef.current === null) return;
    dragIndexRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    onCommit?.();
  };

  const onDoubleClick = (event: React.MouseEvent<SVGSVGElement>): void => {
    const target = toUnit(event.clientX, event.clientY);
    const nearest = target ? findNearestPoint(points, target) : null;
    if (nearest === null) return;
    onChange(removePoint(points, nearest));
    onCommit?.();
  };

  return { svgRef, onPointerDown, onPointerMove, onPointerUp, onDoubleClick };
};

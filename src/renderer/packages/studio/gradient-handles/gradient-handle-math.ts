import type { GradientPoint, PaintGradient } from "@bitgrain/studio-core/model/paint-types";
import type { BoxSize } from "@bitgrain/studio-core/shape-render/paint/gradient-matrix";

export type GradientHandleKind = "start" | "end" | "minor";

const MIN_ASPECT = 0.01;

const normalize = (point: GradientPoint, box: BoxSize): GradientPoint => ({
  x: point.x / box.width,
  y: point.y / box.height,
});

const shiftedOrigin = (initial: PaintGradient, delta: GradientPoint): PaintGradient => {
  const moved = { x: initial.start.x + delta.x, y: initial.start.y + delta.y };
  if (initial.kind === "linear") return { ...initial, start: moved };
  return { ...initial, start: moved, end: { x: initial.end.x + delta.x, y: initial.end.y + delta.y } };
};

const aspectFromPoint = (initial: PaintGradient, point: GradientPoint, box: BoxSize): number => {
  const majorX = (initial.end.x - initial.start.x) * box.width;
  const majorY = (initial.end.y - initial.start.y) * box.height;
  const majorLength = Math.hypot(majorX, majorY);
  if (majorLength === 0) return initial.aspect;
  const offsetX = point.x - initial.start.x * box.width;
  const offsetY = point.y - initial.start.y * box.height;
  const across = Math.abs((offsetX * -majorY + offsetY * majorX) / majorLength);
  return Math.max(MIN_ASPECT, across / majorLength);
};

export interface HandleDrag {
  kind: GradientHandleKind;
  initial: PaintGradient;
  pointerStart: GradientPoint;
  pointer: GradientPoint;
  box: BoxSize;
}

export const draggedGradient = (drag: HandleDrag): PaintGradient => {
  const { kind, initial, pointerStart, pointer, box } = drag;
  if (kind === "minor") return { ...initial, aspect: aspectFromPoint(initial, pointer, box) };
  if (kind === "end") return { ...initial, end: normalize(pointer, box) };
  const delta = normalize({ x: pointer.x - pointerStart.x, y: pointer.y - pointerStart.y }, box);
  return shiftedOrigin(initial, delta);
};

import type { Layer } from "../../model/studio-types";
import {
  DEFAULT_CONSTRAINTS,
  type HorizontalConstraint,
  type LayerConstraints,
  type VerticalConstraint,
} from "../../model/auto-layout-types";
import type { Size } from "./layout-container";

type AxisConstraint = "start" | "end" | "stretch" | "center" | "scale";

interface AxisSpan {
  start: number;
  size: number;
}

export interface ConstrainedBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIN_CONSTRAINED_SIZE = 1;

const HORIZONTAL_AXIS: Record<HorizontalConstraint, AxisConstraint> = {
  left: "start",
  right: "end",
  "left-right": "stretch",
  center: "center",
  scale: "scale",
};

const VERTICAL_AXIS: Record<VerticalConstraint, AxisConstraint> = {
  top: "start",
  bottom: "end",
  "top-bottom": "stretch",
  center: "center",
  scale: "scale",
};

const constrainAxis = (span: AxisSpan, constraint: AxisConstraint, fromLength: number, toLength: number): AxisSpan => {
  const delta = toLength - fromLength;
  if (constraint === "end") return { start: span.start + delta, size: span.size };
  if (constraint === "center") return { start: span.start + delta / 2, size: span.size };
  if (constraint === "stretch") return { start: span.start, size: Math.max(MIN_CONSTRAINED_SIZE, span.size + delta) };
  if (constraint === "scale" && fromLength > 0) {
    const ratio = toLength / fromLength;
    return { start: span.start * ratio, size: Math.max(MIN_CONSTRAINED_SIZE, span.size * ratio) };
  }
  return span;
};

export const resolveConstraints = (layer: Pick<Layer, "constraints">): LayerConstraints =>
  layer.constraints ?? DEFAULT_CONSTRAINTS;

export const constrainBox = (box: ConstrainedBox, constraints: LayerConstraints, from: Size, to: Size): ConstrainedBox => {
  const horizontal = constrainAxis(
    { start: box.x, size: box.width },
    HORIZONTAL_AXIS[constraints.horizontal],
    from.width,
    to.width,
  );
  const vertical = constrainAxis(
    { start: box.y, size: box.height },
    VERTICAL_AXIS[constraints.vertical],
    from.height,
    to.height,
  );
  return { x: horizontal.start, y: vertical.start, width: horizontal.size, height: vertical.size };
};

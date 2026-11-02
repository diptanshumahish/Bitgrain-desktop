import type { FitBox, FitContext } from "./fit-context";

const EDGE_TOUCH_RATIO = 0.005;

interface AxisBox {
  start: number;
  size: number;
}

const touches = (value: number, length: number): boolean => Math.abs(value) <= length * EDGE_TOUCH_RATIO;

const bleedAxis = (source: AxisBox, placed: AxisBox, fromLength: number, toLength: number): AxisBox => {
  const start = touches(source.start, fromLength) ? 0 : placed.start;
  const end = touches(fromLength - source.start - source.size, fromLength) ? toLength : placed.start + placed.size;
  return { start, size: end - start };
};

export const bleedToTouchedEdges = (source: FitBox, placed: FitBox, context: FitContext): FitBox => {
  const horizontal = bleedAxis({ start: source.x, size: source.width }, { start: placed.x, size: placed.width }, context.from.width, context.to.width);
  const vertical = bleedAxis({ start: source.y, size: source.height }, { start: placed.y, size: placed.height }, context.from.height, context.to.height);
  return { x: horizontal.start, y: vertical.start, width: horizontal.size, height: vertical.size };
};

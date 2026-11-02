import type { FitBox, FitSize } from "./fit-context";

const INSIDE_TOLERANCE_PX = 1;

const insideAxis = (start: number, size: number, length: number): boolean =>
  start >= -INSIDE_TOLERANCE_PX && start + size <= length + INSIDE_TOLERANCE_PX;

const clampAxis = (start: number, size: number, length: number): number => {
  if (size >= length) return (length - size) / 2;
  return Math.min(Math.max(start, 0), length - size);
};

export const keepOnCanvas = (source: FitBox, placed: FitBox, from: FitSize, to: FitSize): FitBox => ({
  ...placed,
  x: insideAxis(source.x, source.width, from.width) ? clampAxis(placed.x, placed.width, to.width) : placed.x,
  y: insideAxis(source.y, source.height, from.height) ? clampAxis(placed.y, placed.height, to.height) : placed.y,
});

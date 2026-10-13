import type { LinearShape, MaskShape, RadialShape } from "./mask-types";

const RADIAL_SOLID_CORE = 0.6;
const MIN_EXTENT = 1e-4;
const HALF_PIXEL = 0.5;

const smoothstep = (edgeStart: number, edgeEnd: number, value: number): number => {
  const t = Math.min(1, Math.max(0, (value - edgeStart) / (edgeEnd - edgeStart)));
  return t * t * (3 - 2 * t);
};

const linearAt = (shape: LinearShape, x: number, y: number): number => {
  const deltaX = shape.x2 - shape.x1;
  const deltaY = shape.y2 - shape.y1;
  const lengthSquared = Math.max(MIN_EXTENT, deltaX * deltaX + deltaY * deltaY);
  const progress = ((x - shape.x1) * deltaX + (y - shape.y1) * deltaY) / lengthSquared;
  return 1 - smoothstep(0, 1, progress);
};

const radialAt = (shape: RadialShape, x: number, y: number): number => {
  const normalizedX = (x - shape.cx) / Math.max(MIN_EXTENT, shape.rx);
  const normalizedY = (y - shape.cy) / Math.max(MIN_EXTENT, shape.ry);
  return 1 - smoothstep(RADIAL_SOLID_CORE, 1, Math.hypot(normalizedX, normalizedY));
};

export const shapeAlphaAt = (shape: MaskShape, x: number, y: number): number =>
  shape.kind === "linear" ? linearAt(shape, x, y) : radialAt(shape, x, y);

export const fillShapeAlpha = (alpha: Float32Array, shape: MaskShape, width: number, height: number): void => {
  for (let row = 0; row < height; row += 1) {
    const y = (row + HALF_PIXEL) / height;
    for (let column = 0; column < width; column += 1) {
      const index = row * width + column;
      alpha[index] = Math.max(alpha[index], shapeAlphaAt(shape, (column + HALF_PIXEL) / width, y));
    }
  }
};

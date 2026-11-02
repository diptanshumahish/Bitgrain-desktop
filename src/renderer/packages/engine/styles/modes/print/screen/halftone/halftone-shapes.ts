export type ShapeDistance = (x: number, y: number) => number;

const SQRT_THREE = Math.sqrt(3);
const HALF_SQRT_TWO = Math.SQRT1_2;
const ELLIPSE_SQUASH = 1.55;
const SQUARE_HALF = 0.88;
const TRIANGLE_SCALE = 0.9;
const RING_RADIUS = 0.72;
const RING_HALF_WIDTH = 0.28;
const BAR_HALF = 0.34;
const XMARK_HALF = 0.3;
const HEX_RADIUS = 0.86;
const HEX_K_X = -0.866025404;
const HEX_K_Y = 0.5;
const HEX_K_Z = 0.577350269;

export const boxDistance = (x: number, y: number, halfWidth: number, halfHeight: number): number => {
  const outsideX = Math.abs(x) - halfWidth;
  const outsideY = Math.abs(y) - halfHeight;
  const outside = Math.hypot(Math.max(outsideX, 0), Math.max(outsideY, 0));
  return outside + Math.min(Math.max(outsideX, outsideY), 0);
};

const plusDistance = (x: number, y: number, half: number): number =>
  Math.min(boxDistance(x, y, 1, half), boxDistance(x, y, half, 1));

export const circleDistance: ShapeDistance = (x, y) => Math.hypot(x, y) - 1;
export const ellipseDistance: ShapeDistance = (x, y) => Math.hypot(x, ELLIPSE_SQUASH * y) - 1;
export const squareDistance: ShapeDistance = (x, y) => boxDistance(x, y, SQUARE_HALF, SQUARE_HALF);
export const diamondDistance: ShapeDistance = (x, y) => (Math.abs(x) + Math.abs(y) - 1) * HALF_SQRT_TWO;
export const ringDistance: ShapeDistance = (x, y) => Math.abs(Math.hypot(x, y) - RING_RADIUS) - RING_HALF_WIDTH;
export const plusShapeDistance: ShapeDistance = (x, y) => plusDistance(x, y, BAR_HALF);
export const dashDistance: ShapeDistance = (x, y) => boxDistance(x, y, 1, BAR_HALF);

export const xmarkDistance: ShapeDistance = (x, y) =>
  plusDistance((x + y) * HALF_SQRT_TWO, (y - x) * HALF_SQRT_TWO, XMARK_HALF);

export const triangleDistance: ShapeDistance = (x, y) => {
  let pointX = Math.abs(x * TRIANGLE_SCALE) - 1;
  let pointY = -y * TRIANGLE_SCALE + 1 / SQRT_THREE;
  if (pointX + SQRT_THREE * pointY > 0) {
    const foldedX = (pointX - SQRT_THREE * pointY) / 2;
    pointY = (-SQRT_THREE * pointX - pointY) / 2;
    pointX = foldedX;
  }
  pointX -= Math.min(0, Math.max(-2, pointX));
  return -Math.hypot(pointX, pointY) * Math.sign(pointY);
};

export const hexagonDistance: ShapeDistance = (x, y) => {
  let pointX = Math.abs(x);
  let pointY = Math.abs(y);
  const fold = 2 * Math.min(HEX_K_X * pointX + HEX_K_Y * pointY, 0);
  pointX -= fold * HEX_K_X;
  pointY -= fold * HEX_K_Y;
  const limit = HEX_K_Z * HEX_RADIUS;
  pointX -= Math.min(limit, Math.max(-limit, pointX));
  pointY -= HEX_RADIUS;
  return Math.hypot(pointX, pointY) * Math.sign(pointY);
};

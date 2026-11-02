export interface Point {
  x: number;
  y: number;
}

export interface Matrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;
const SKEW_TOLERANCE = 1e-3;

export const IDENTITY: Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

export const multiply = (left: Matrix, right: Matrix): Matrix => ({
  a: left.a * right.a + left.c * right.b,
  b: left.b * right.a + left.d * right.b,
  c: left.a * right.c + left.c * right.d,
  d: left.b * right.c + left.d * right.d,
  e: left.a * right.e + left.c * right.f + left.e,
  f: left.b * right.e + left.d * right.f + left.f,
});

export const translation = (x: number, y: number): Matrix => ({ ...IDENTITY, e: x, f: y });

export const scaling = (x: number, y: number): Matrix => ({ ...IDENTITY, a: x, d: y });

export const rotation = (degrees: number): Matrix => {
  const radians = degrees * DEGREES_TO_RADIANS;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 };
};

export const skewX = (degrees: number): Matrix => ({ ...IDENTITY, c: Math.tan(degrees * DEGREES_TO_RADIANS) });

export const skewY = (degrees: number): Matrix => ({ ...IDENTITY, b: Math.tan(degrees * DEGREES_TO_RADIANS) });

export const applyToPoint = (matrix: Matrix, point: Point): Point => ({
  x: matrix.a * point.x + matrix.c * point.y + matrix.e,
  y: matrix.b * point.x + matrix.d * point.y + matrix.f,
});

export const uniformScale = (matrix: Matrix): number => Math.sqrt(Math.abs(matrix.a * matrix.d - matrix.b * matrix.c));

export const axisScaleX = (matrix: Matrix): number => Math.hypot(matrix.a, matrix.b);

export const axisScaleY = (matrix: Matrix): number => Math.hypot(matrix.c, matrix.d);

export const rotationDegrees = (matrix: Matrix): number => Math.atan2(matrix.b, matrix.a) * RADIANS_TO_DEGREES;

export const isRigidLike = (matrix: Matrix): boolean => {
  const dot = matrix.a * matrix.c + matrix.b * matrix.d;
  const scaleProduct = axisScaleX(matrix) * axisScaleY(matrix);
  const determinant = matrix.a * matrix.d - matrix.b * matrix.c;
  return scaleProduct > 0 && Math.abs(dot) / scaleProduct < SKEW_TOLERANCE && determinant > 0;
};

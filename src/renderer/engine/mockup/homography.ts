import type { Matrix3x3, MockupPoint, MockupQuad } from "./mockup-types";

const DEGENERATE_EPSILON = 1e-9;

const solveAffine = (quad: MockupQuad): Matrix3x3 => {
  const [origin, alongU, , alongV] = quad;
  return [
    alongU.x - origin.x, alongV.x - origin.x, origin.x,
    alongU.y - origin.y, alongV.y - origin.y, origin.y,
    0, 0, 1,
  ];
};

const solveProjective = (quad: MockupQuad, shearX: number, shearY: number): Matrix3x3 | null => {
  const [origin, alongU, opposite, alongV] = quad;
  const deltaUx = alongU.x - opposite.x;
  const deltaVx = alongV.x - opposite.x;
  const deltaUy = alongU.y - opposite.y;
  const deltaVy = alongV.y - opposite.y;
  const denominator = deltaUx * deltaVy - deltaVx * deltaUy;
  if (Math.abs(denominator) < DEGENERATE_EPSILON) return null;

  const perspectiveU = (shearX * deltaVy - deltaVx * shearY) / denominator;
  const perspectiveV = (deltaUx * shearY - shearX * deltaUy) / denominator;
  return [
    alongU.x - origin.x + perspectiveU * alongU.x, alongV.x - origin.x + perspectiveV * alongV.x, origin.x,
    alongU.y - origin.y + perspectiveU * alongU.y, alongV.y - origin.y + perspectiveV * alongV.y, origin.y,
    perspectiveU, perspectiveV, 1,
  ];
};

export const solveUnitSquareToQuad = (quad: MockupQuad): Matrix3x3 | null => {
  const [origin, alongU, opposite, alongV] = quad;
  const shearX = origin.x - alongU.x + opposite.x - alongV.x;
  const shearY = origin.y - alongU.y + opposite.y - alongV.y;
  if (Math.abs(shearX) < DEGENERATE_EPSILON && Math.abs(shearY) < DEGENERATE_EPSILON) {
    return solveAffine(quad);
  }
  return solveProjective(quad, shearX, shearY);
};

export const invertMatrix3x3 = (matrix: Matrix3x3): Matrix3x3 | null => {
  const [a, b, c, d, e, f, g, h, i] = matrix;
  const cofactorA = e * i - f * h;
  const cofactorB = f * g - d * i;
  const cofactorC = d * h - e * g;
  const determinant = a * cofactorA + b * cofactorB + c * cofactorC;
  if (Math.abs(determinant) < DEGENERATE_EPSILON) return null;

  const inverseDeterminant = 1 / determinant;
  return [
    cofactorA * inverseDeterminant, (c * h - b * i) * inverseDeterminant, (b * f - c * e) * inverseDeterminant,
    cofactorB * inverseDeterminant, (a * i - c * g) * inverseDeterminant, (c * d - a * f) * inverseDeterminant,
    cofactorC * inverseDeterminant, (b * g - a * h) * inverseDeterminant, (a * e - b * d) * inverseDeterminant,
  ];
};

export const solveQuadToUnitSquare = (quad: MockupQuad): Matrix3x3 | null => {
  const forward = solveUnitSquareToQuad(quad);
  if (!forward) return null;
  return invertMatrix3x3(forward);
};

export const projectPoint = (matrix: Matrix3x3, point: MockupPoint): MockupPoint => {
  const [a, b, c, d, e, f, g, h, i] = matrix;
  const denominator = g * point.x + h * point.y + i;
  const safeDenominator = Math.abs(denominator) < DEGENERATE_EPSILON ? DEGENERATE_EPSILON : denominator;
  return {
    x: (a * point.x + b * point.y + c) / safeDenominator,
    y: (d * point.x + e * point.y + f) / safeDenominator,
  };
};

const crossProductSign = (origin: MockupPoint, first: MockupPoint, second: MockupPoint): number => {
  const value = (first.x - origin.x) * (second.y - origin.y) - (first.y - origin.y) * (second.x - origin.x);
  return Math.sign(value);
};

export const isConvexQuad = (quad: MockupQuad): boolean => {
  let positive = 0;
  let negative = 0;
  for (let index = 0; index < 4; index += 1) {
    const sign = crossProductSign(quad[index], quad[(index + 1) % 4], quad[(index + 2) % 4]);
    if (sign > 0) positive += 1;
    if (sign < 0) negative += 1;
  }
  return positive === 0 || negative === 0;
};

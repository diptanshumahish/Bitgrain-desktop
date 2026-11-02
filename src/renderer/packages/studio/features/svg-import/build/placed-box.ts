import { applyToPoint, axisScaleX, axisScaleY, rotationDegrees, type Matrix } from "../geometry/matrix";

interface PlacedBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface LocalRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ROTATION_EPSILON = 1e-3;

export const placeRect = (rect: LocalRect, matrix: Matrix): PlacedBox => {
  const center = applyToPoint(matrix, { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
  const width = rect.width * axisScaleX(matrix);
  const height = rect.height * axisScaleY(matrix);
  const rotation = rotationDegrees(matrix);
  return {
    x: center.x - width / 2,
    y: center.y - height / 2,
    width,
    height,
    rotation: Math.abs(rotation) < ROTATION_EPSILON ? 0 : rotation,
  };
};

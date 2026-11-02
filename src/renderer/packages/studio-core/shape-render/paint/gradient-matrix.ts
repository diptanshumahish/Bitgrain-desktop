import type { GradientPoint, PaintGradient } from "../../model/paint-types";

const MIN_AXIS_LENGTH = 1e-6;
const DIGITS = 5;

export interface BoxSize {
  width: number;
  height: number;
}

interface GradientAxes {
  origin: GradientPoint;
  major: GradientPoint;
  minor: GradientPoint;
}

export const gradientAxes = (gradient: PaintGradient, box: BoxSize): GradientAxes | null => {
  const majorX = (gradient.end.x - gradient.start.x) * box.width;
  const majorY = (gradient.end.y - gradient.start.y) * box.height;
  if (Math.hypot(majorX, majorY) < MIN_AXIS_LENGTH) return null;
  return {
    origin: { x: gradient.start.x * box.width, y: gradient.start.y * box.height },
    major: { x: majorX, y: majorY },
    minor: { x: -majorY * gradient.aspect, y: majorX * gradient.aspect },
  };
};

const num = (value: number): number => Number(value.toFixed(DIGITS));

export const gradientMatrix = (gradient: PaintGradient, userBox: BoxSize, pixelBox: BoxSize): string | null => {
  const axes = gradientAxes(gradient, pixelBox);
  if (!axes) return null;
  const scaleX = userBox.width / pixelBox.width;
  const scaleY = userBox.height / pixelBox.height;
  const values = [
    axes.major.x * scaleX,
    axes.major.y * scaleY,
    axes.minor.x * scaleX,
    axes.minor.y * scaleY,
    axes.origin.x * scaleX,
    axes.origin.y * scaleY,
  ];
  return `matrix(${values.map(num).join(" ")})`;
};

const EXTENT_MARGIN = 1.5;

export const gradientExtent = (axes: GradientAxes, box: BoxSize): number => {
  const determinant = axes.major.x * axes.minor.y - axes.minor.x * axes.major.y;
  if (Math.abs(determinant) < MIN_AXIS_LENGTH) return 1;
  const corners = [[0, 0], [box.width, 0], [box.width, box.height], [0, box.height]];
  const reach = corners.map(([cornerX, cornerY]) => {
    const dx = cornerX - axes.origin.x;
    const dy = cornerY - axes.origin.y;
    const u = (dx * axes.minor.y - dy * axes.minor.x) / determinant;
    const v = (axes.major.x * dy - axes.major.y * dx) / determinant;
    return Math.hypot(u, v);
  });
  return Math.max(1, ...reach) * EXTENT_MARGIN;
};

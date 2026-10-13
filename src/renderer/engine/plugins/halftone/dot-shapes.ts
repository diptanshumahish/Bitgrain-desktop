import type { HalftoneShape } from "./halftone-defaults";

const ELLIPSE_ASPECT = 1.6;
const ROUND_TOUCH_DENSITY = Math.PI / 4;
const ROUND_FULL_REACH = Math.SQRT1_2;
const HALF_CELL = 0.5;
const DIAMOND_TOUCH_DENSITY = 0.5;
const DIAMOND_FULL_REACH = 1;
const ELLIPSE_TOUCH_DENSITY = (Math.PI * HALF_CELL * HALF_CELL) / ELLIPSE_ASPECT;
const ELLIPSE_FULL_REACH = ROUND_FULL_REACH * ELLIPSE_ASPECT;

const growPastTouch = (density: number, touchDensity: number, touchReach: number, fullReach: number): number =>
  touchReach + (fullReach - touchReach) * ((density - touchDensity) / (1 - touchDensity));

export const shapeReach = (density: number, shape: HalftoneShape): number => {
  if (density <= 0) return 0;
  switch (shape) {
    case "square":
      return HALF_CELL * Math.sqrt(density);
    case "line":
      return HALF_CELL * density;
    case "diamond":
      return density <= DIAMOND_TOUCH_DENSITY
        ? Math.sqrt(density / 2)
        : growPastTouch(density, DIAMOND_TOUCH_DENSITY, HALF_CELL, DIAMOND_FULL_REACH);
    case "ellipse":
      return density <= ELLIPSE_TOUCH_DENSITY
        ? Math.sqrt((density * ELLIPSE_ASPECT) / Math.PI)
        : growPastTouch(density, ELLIPSE_TOUCH_DENSITY, HALF_CELL, ELLIPSE_FULL_REACH);
    default:
      return density <= ROUND_TOUCH_DENSITY
        ? Math.sqrt(density / Math.PI)
        : growPastTouch(density, ROUND_TOUCH_DENSITY, HALF_CELL, ROUND_FULL_REACH);
  }
};

export const shapeDistance = (offsetX: number, offsetY: number, shape: HalftoneShape): number => {
  const absX = Math.abs(offsetX);
  const absY = Math.abs(offsetY);
  switch (shape) {
    case "square":
      return Math.max(absX, absY);
    case "line":
      return absY;
    case "diamond":
      return absX + absY;
    case "ellipse":
      return Math.sqrt(absX * absX + absY * absY * ELLIPSE_ASPECT * ELLIPSE_ASPECT);
    default:
      return Math.sqrt(absX * absX + absY * absY);
  }
};

export const SHAPE_ELLIPSE_ASPECT = ELLIPSE_ASPECT;

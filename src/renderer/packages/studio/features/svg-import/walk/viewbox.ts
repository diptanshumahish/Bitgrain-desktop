import { IDENTITY, multiply, scaling, translation, type Matrix } from "../geometry/matrix";
import type { Viewport } from "./walk-context";

const VIEWBOX_PARTS = 4;
const HALF = 0.5;

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const parseViewBox = (raw: string | null): ViewBox | null => {
  const parts = (raw ?? "").trim().split(/[\s,]+/).map(Number);
  if (parts.length !== VIEWBOX_PARTS || parts.some((part) => !Number.isFinite(part))) return null;
  const [x, y, width, height] = parts;
  if (width <= 0 || height <= 0) return null;
  return { x, y, width, height };
};

const alignFactor = (align: string, axis: "x" | "y"): number => {
  const token = axis === "x" ? align.slice(1, 4) : align.slice(5, 8);
  if (token === "Min") return 0;
  if (token === "Max") return 1;
  return HALF;
};

export const viewBoxMatrix = (viewBox: ViewBox | null, viewport: Viewport, aspect: string | null): Matrix => {
  if (!viewBox) return IDENTITY;
  const scaleX = viewport.width / viewBox.width;
  const scaleY = viewport.height / viewBox.height;
  const [align = "xMidYMid", mode = "meet"] = (aspect ?? "").trim().split(/\s+/).filter(Boolean);
  if (align === "none") return multiply(scaling(scaleX, scaleY), translation(-viewBox.x, -viewBox.y));
  const uniform = mode === "slice" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
  const offsetX = (viewport.width - viewBox.width * uniform) * alignFactor(align, "x");
  const offsetY = (viewport.height - viewBox.height * uniform) * alignFactor(align, "y");
  return multiply(translation(offsetX, offsetY), multiply(scaling(uniform, uniform), translation(-viewBox.x, -viewBox.y)));
};

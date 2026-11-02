import type { CropRect } from "./crop-aspect";

export type CropHandle = "tl" | "tr" | "bl" | "br" | "move";

const CROP_MIN_SIZE = 20;
export const CROP_HANDLE_SIZE = 10;

const clamp = (value: number, low: number, high: number): number => Math.max(low, Math.min(high, value));

const isNear = (value: number, target: number): boolean => Math.abs(value - target) <= CROP_HANDLE_SIZE;

const isInside = (pointX: number, pointY: number, rect: CropRect, margin: number): boolean =>
  pointX >= rect.x - margin && pointX <= rect.x + rect.w + margin && pointY >= rect.y - margin && pointY <= rect.y + rect.h + margin;

export const findCropHandle = (pointX: number, pointY: number, rect: CropRect): CropHandle | null => {
  if (!isInside(pointX, pointY, rect, CROP_HANDLE_SIZE)) return null;
  const right = rect.x + rect.w;
  const bottom = rect.y + rect.h;
  if (isNear(pointX, rect.x) && isNear(pointY, rect.y)) return "tl";
  if (isNear(pointX, right) && isNear(pointY, rect.y)) return "tr";
  if (isNear(pointX, rect.x) && isNear(pointY, bottom)) return "bl";
  if (isNear(pointX, right) && isNear(pointY, bottom)) return "br";
  return isInside(pointX, pointY, rect, 0) ? "move" : null;
};

const moveLeftEdge = (start: CropRect, deltaX: number): Pick<CropRect, "x" | "w"> => {
  const x = clamp(start.x + deltaX, 0, start.x + start.w - CROP_MIN_SIZE);
  return { x, w: start.w + start.x - x };
};

const moveTopEdge = (start: CropRect, deltaY: number): Pick<CropRect, "y" | "h"> => {
  const y = clamp(start.y + deltaY, 0, start.y + start.h - CROP_MIN_SIZE);
  return { y, h: start.h + start.y - y };
};

const moveRightEdge = (start: CropRect, deltaX: number, maxW: number): Pick<CropRect, "x" | "w"> => ({
  x: start.x,
  w: clamp(start.w + deltaX, CROP_MIN_SIZE, maxW - start.x),
});

const moveBottomEdge = (start: CropRect, deltaY: number, maxH: number): Pick<CropRect, "y" | "h"> => ({
  y: start.y,
  h: clamp(start.h + deltaY, CROP_MIN_SIZE, maxH - start.y),
});

export const dragCropRect = (handle: CropHandle, start: CropRect, deltaX: number, deltaY: number, maxW: number, maxH: number): CropRect => {
  if (handle === "move") {
    return { ...start, x: clamp(start.x + deltaX, 0, maxW - start.w), y: clamp(start.y + deltaY, 0, maxH - start.h) };
  }
  const horizontal = handle === "tl" || handle === "bl" ? moveLeftEdge(start, deltaX) : moveRightEdge(start, deltaX, maxW);
  const vertical = handle === "tl" || handle === "tr" ? moveTopEdge(start, deltaY) : moveBottomEdge(start, deltaY, maxH);
  return { ...horizontal, ...vertical };
};

export const cursorForHandle = (handle: CropHandle): string => {
  if (handle === "move") return "move";
  return handle === "tl" || handle === "br" ? "nwse-resize" : "nesw-resize";
};

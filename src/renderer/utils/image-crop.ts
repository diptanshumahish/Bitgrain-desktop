import type { ImageCrop } from "../data/studioTypes";
import type { CSSProperties } from "react";

export type ImageFit = "cover" | "contain" | "fill";

export interface FittedRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const MIN_CROP_ZOOM = 1;
export const MAX_CROP_ZOOM = 8;
const CENTER = 0.5;
const PERCENT = 100;

export const DEFAULT_CROP: ImageCrop = { zoom: MIN_CROP_ZOOM, focusX: CENTER, focusY: CENTER };

const clampUnit = (value: number): number => Math.min(1, Math.max(0, value));

export const clampCrop = (crop: ImageCrop): ImageCrop => ({
  zoom: Math.min(MAX_CROP_ZOOM, Math.max(MIN_CROP_ZOOM, crop.zoom)),
  focusX: clampUnit(crop.focusX),
  focusY: clampUnit(crop.focusY),
});

export const isDefaultCrop = (crop?: ImageCrop): boolean =>
  !crop || (crop.zoom === MIN_CROP_ZOOM && crop.focusX === CENTER && crop.focusY === CENTER);

const baseScales = (fit: ImageFit, imageWidth: number, imageHeight: number, boxWidth: number, boxHeight: number): [number, number] => {
  const scaleX = boxWidth / imageWidth;
  const scaleY = boxHeight / imageHeight;
  if (fit === "fill") return [scaleX, scaleY];
  const uniform = fit === "cover" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
  return [uniform, uniform];
};

export const fittedRect = (
  fit: ImageFit,
  imageWidth: number,
  imageHeight: number,
  box: FittedRect,
  crop: ImageCrop = DEFAULT_CROP,
): FittedRect => {
  const [scaleX, scaleY] = baseScales(fit, imageWidth, imageHeight, box.width, box.height);
  const width = imageWidth * scaleX * crop.zoom;
  const height = imageHeight * scaleY * crop.zoom;
  return {
    x: box.x + (box.width - width) * crop.focusX,
    y: box.y + (box.height - height) * crop.focusY,
    width,
    height,
  };
};

export const cropImageStyle = (crop?: ImageCrop): CSSProperties => {
  if (isDefaultCrop(crop) || !crop) return {};
  const origin = `${crop.focusX * PERCENT}% ${crop.focusY * PERCENT}%`;
  return { objectPosition: origin, transformOrigin: origin, transform: `scale(${crop.zoom})` };
};

export const panCrop = (crop: ImageCrop, overflowX: number, overflowY: number, deltaX: number, deltaY: number): ImageCrop =>
  clampCrop({
    ...crop,
    focusX: overflowX !== 0 ? crop.focusX + deltaX / overflowX : crop.focusX,
    focusY: overflowY !== 0 ? crop.focusY + deltaY / overflowY : crop.focusY,
  });

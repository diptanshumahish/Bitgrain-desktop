import type { CornerOptions, CornerRadii } from "../../model/paint-types";
import { smoothCornerPath, type BoxRect } from "../geometry/corner-path";

export interface CornerLayer extends CornerOptions {
  borderRadius?: number;
  width: number;
  height: number;
}

const cornerRadiiOf = (layer: CornerLayer): CornerRadii => {
  const radius = layer.borderRadius ?? 0;
  return layer.cornerRadii ?? [radius, radius, radius, radius];
};

const hasSmoothCorners = (layer: CornerLayer): boolean => (layer.cornerSmoothing ?? 0) > 0;

export const hasCustomCorners = (layer: CornerLayer): boolean => Boolean(layer.cornerRadii) || hasSmoothCorners(layer);

export const cornerCssRadius = (layer: CornerLayer): string | number => {
  if (!layer.cornerRadii) return layer.borderRadius ?? 0;
  return layer.cornerRadii.map((radius) => `${radius}px`).join(" ");
};

export const cornerPathD = (layer: CornerLayer, box: BoxRect, scale: number): string =>
  smoothCornerPath(box, cornerRadiiOf(layer).map((radius) => radius * scale) as CornerRadii, layer.cornerSmoothing ?? 0);

export const cornerCssClipPath = (layer: CornerLayer): string | undefined => {
  if (!hasSmoothCorners(layer)) return undefined;
  return `path("${cornerPathD(layer, { x: 0, y: 0, width: layer.width, height: layer.height }, 1)}")`;
};

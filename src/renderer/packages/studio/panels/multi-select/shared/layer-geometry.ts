import type { Layer } from "@bitgrain/studio-core/model/studio-types";

export const readRadius = (layer: Layer): number | null => {
  if (layer.type === "shape" || layer.type === "upload") return layer.borderRadius;
  if (layer.type === "image") return layer.borderRadius ?? 0;
  return null;
};

export const radiusUpdate = (layer: Layer, radius: number): Partial<Layer> | null =>
  readRadius(layer) === null ? null : { borderRadius: radius };

export const readRotation = (layer: Layer): number => layer.rotation ?? 0;

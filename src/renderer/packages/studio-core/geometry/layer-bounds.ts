import type { Layer } from "../model/studio-types";

export interface LayerBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DEGREES_TO_RADIANS = Math.PI / 180;

const rotationOf = (layer: Layer): number => ("rotation" in layer ? layer.rotation ?? 0 : 0);

export const rotatedBounds = (layer: Layer): LayerBounds => {
  const radians = rotationOf(layer) * DEGREES_TO_RADIANS;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  const width = layer.width * cos + layer.height * sin;
  const height = layer.width * sin + layer.height * cos;
  return {
    x: layer.x + layer.width / 2 - width / 2,
    y: layer.y + layer.height / 2 - height / 2,
    width,
    height,
  };
};

export const unionLayerBounds = (layers: Layer[]): LayerBounds | null => {
  if (layers.length === 0) return null;
  const boxes = layers.map(rotatedBounds);
  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

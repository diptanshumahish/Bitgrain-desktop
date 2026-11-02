import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { richStripUpdate } from "./rich-strip";

const LINE_SHAPES: ReadonlySet<string> = new Set(["line", "arrow"]);

export const readFill = (layer: Layer): string | null => {
  switch (layer.type) {
    case "shape":
      return LINE_SHAPES.has(layer.shapeType) ? null : layer.fill;
    case "vector":
      return layer.fill;
    case "text":
    case "ink":
      return layer.color;
    case "frame":
      return layer.background;
    default:
      return null;
  }
};

export const fillUpdate = (layer: Layer, color: string): Partial<Layer> | null => {
  switch (layer.type) {
    case "shape":
      return LINE_SHAPES.has(layer.shapeType) ? null : { fill: color, fillVar: undefined };
    case "vector":
      return { fill: color, fillVar: undefined };
    case "text":
      return { color, colorVar: undefined, ...richStripUpdate(layer, "color") };
    case "ink":
      return { color, colorVar: undefined };
    case "frame":
      return { background: color, backgroundVar: undefined };
    default:
      return null;
  }
};

export const readStrokeColor = (layer: Layer): string | null => {
  if (layer.type === "shape") return layer.stroke;
  if (layer.type === "vector") return layer.strokeColor;
  return null;
};

export const strokeColorUpdate = (layer: Layer, color: string): Partial<Layer> | null => {
  if (layer.type === "shape") return { stroke: color, strokeVar: undefined };
  if (layer.type === "vector") return { strokeColor: color, strokeColorVar: undefined };
  return null;
};

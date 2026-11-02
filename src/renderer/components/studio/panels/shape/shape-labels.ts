import type { ShapeType } from "../../../../data/studioTypes";

const SHAPE_NAMES: Record<ShapeType, string> = {
  rect: "Rectangle",
  circle: "Ellipse",
  triangle: "Triangle",
  diamond: "Diamond",
  star: "Star",
  pentagon: "Pentagon",
  hexagon: "Hexagon",
  line: "Line",
  arrow: "Arrow",
  "frame-thin": "Thin frame",
  "frame-thick": "Thick frame",
  "frame-round": "Round frame",
  "frame-double": "Double frame",
};

export const shapeName = (shapeType: ShapeType): string => SHAPE_NAMES[shapeType];

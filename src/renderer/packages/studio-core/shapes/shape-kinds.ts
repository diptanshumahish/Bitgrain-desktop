import type { ShapeType } from "../model/studio-types";

export const isFrameShape = (shapeType: ShapeType): boolean => shapeType.startsWith("frame");

export const isLineShape = (shapeType: ShapeType): boolean => shapeType === "line" || shapeType === "arrow";

export const isPolygonShape = (shapeType: ShapeType): boolean => shapeType === "pentagon" || shapeType === "hexagon";

export const isClosedShape = (shapeType: ShapeType): boolean => !isFrameShape(shapeType) && !isLineShape(shapeType);

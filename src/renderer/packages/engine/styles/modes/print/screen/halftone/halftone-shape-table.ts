import type { SelectOption } from "../../../../engine/style-types";
import {
  circleDistance, dashDistance, diamondDistance, ellipseDistance, hexagonDistance, plusShapeDistance,
  ringDistance, squareDistance, triangleDistance, xmarkDistance, type ShapeDistance,
} from "./halftone-shapes";
import { heartDistance, petalDistance, sparkleDistance, star5Distance } from "./halftone-star-shapes";

interface DotShape {
  id: string;
  label: string;
  distance: ShapeDistance;
  areaGain: number;
}

const DOT_SHAPES: readonly DotShape[] = [
  { id: "circle", label: "Round", distance: circleDistance, areaGain: 1 },
  { id: "ellipse", label: "Elliptical", distance: ellipseDistance, areaGain: 1.12 },
  { id: "square", label: "Square", distance: squareDistance, areaGain: 0.92 },
  { id: "diamond", label: "Diamond", distance: diamondDistance, areaGain: 1.14 },
  { id: "triangle", label: "Triangle", distance: triangleDistance, areaGain: 1.28 },
  { id: "ring", label: "Ring", distance: ringDistance, areaGain: 1.35 },
  { id: "plus", label: "Plus", distance: plusShapeDistance, areaGain: 1.2 },
  { id: "xmark", label: "X", distance: xmarkDistance, areaGain: 1.2 },
  { id: "hexagon", label: "Hexagon", distance: hexagonDistance, areaGain: 0.92 },
  { id: "star5", label: "Star", distance: star5Distance, areaGain: 1.34 },
  { id: "sparkle4", label: "Sparkle", distance: sparkleDistance, areaGain: 1.4 },
  { id: "heart", label: "Heart", distance: heartDistance, areaGain: 1.1 },
  { id: "petal", label: "Clover", distance: petalDistance, areaGain: 1.24 },
  { id: "dash", label: "Dash", distance: dashDistance, areaGain: 1.1 },
];

export const DOT_SHAPE_OPTIONS: readonly SelectOption[] = DOT_SHAPES.map((shape) => ({ value: shape.id, label: shape.label }));

export const dotShapeFor = (id: string): DotShape => DOT_SHAPES.find((shape) => shape.id === id) ?? DOT_SHAPES[0];

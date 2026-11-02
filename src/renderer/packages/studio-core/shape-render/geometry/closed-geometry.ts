import type { ShapeLayer } from "../../model/studio-types";
import { svgNode, type SvgNode } from "../svg-node/svg-node";
import { smoothCornerPath } from "./corner-path";
import { polygonPoints, starPoints, type EllipseFrame } from "./radial-points";
import { arcPath, isFullDisc, type ArcOptions } from "./arc-path";

const DEFAULT_STAR_POINTS = 5;
const DEFAULT_STAR_INNER = 0.42;
const PENTAGON_SIDES = 5;
const HEXAGON_SIDES = 6;
const FULL_TURN_DEG = 360;

const rectGeometry = (layer: ShapeLayer, inset: number): SvgNode => {
  const width = Math.max(0, layer.width - inset * 2);
  const height = Math.max(0, layer.height - inset * 2);
  const smoothing = layer.cornerSmoothing ?? 0;
  if (!layer.cornerRadii && smoothing <= 0) {
    return svgNode("rect", { x: inset, y: inset, width, height, rx: layer.borderRadius, ry: layer.borderRadius });
  }
  const radius = layer.borderRadius;
  const radii = layer.cornerRadii ?? [radius, radius, radius, radius];
  return svgNode("path", { d: smoothCornerPath({ x: inset, y: inset, width, height }, radii, smoothing) });
};

const arcOptionsFor = (layer: ShapeLayer): ArcOptions => ({
  startDeg: layer.arcStart ?? 0,
  sweepDeg: layer.arcSweep ?? FULL_TURN_DEG,
  innerRatio: layer.arcInnerRatio ?? 0,
});

const ellipseGeometry = (layer: ShapeLayer, frame: EllipseFrame): SvgNode => {
  const options = arcOptionsFor(layer);
  if (isFullDisc(options)) return svgNode("ellipse", { cx: frame.cx, cy: frame.cy, rx: frame.rx, ry: frame.ry });
  return svgNode("path", { d: arcPath(frame, options), fillRule: "evenodd", clipRule: "evenodd" });
};

const legacySides = (layer: ShapeLayer): number =>
  layer.polygonSides ?? (layer.shapeType === "pentagon" ? PENTAGON_SIDES : HEXAGON_SIDES);

export const closedGeometry = (layer: ShapeLayer, inset: number): SvgNode | null => {
  const width = layer.width;
  const height = layer.height;
  const cx = width / 2;
  const cy = height / 2;
  const frame: EllipseFrame = { cx, cy, rx: Math.max(0, cx - inset), ry: Math.max(0, cy - inset) };
  switch (layer.shapeType) {
    case "rect":
      return rectGeometry(layer, inset);
    case "circle":
      return ellipseGeometry(layer, frame);
    case "triangle":
      return svgNode("polygon", { points: `${cx},${inset} ${width - inset},${height - inset} ${inset},${height - inset}` });
    case "diamond":
      return svgNode("polygon", { points: `${cx},${inset} ${width - inset},${cy} ${cx},${height - inset} ${inset},${cy}` });
    case "star":
      return svgNode("polygon", {
        points: starPoints({ ...frame, rx: cx - inset, ry: cy - inset }, layer.starInnerRatio ?? DEFAULT_STAR_INNER, layer.starPoints ?? DEFAULT_STAR_POINTS),
      });
    case "pentagon":
    case "hexagon":
      return svgNode("polygon", { points: polygonPoints({ ...frame, rx: cx - inset, ry: cy - inset }, legacySides(layer)) });
    default:
      return null;
  }
};

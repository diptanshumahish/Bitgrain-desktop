import type { ShapeLayer } from "../../model/studio-types";
import { svgNode, type SvgAttrs, type SvgNode } from "../svg-node/svg-node";

const THIN_WIDTH = 3;
const THICK_RATIO = 0.08;
const DOUBLE_OUTER = 4;
const DOUBLE_INNER = 10;
const DOUBLE_WIDTH = 2;
const ROUND_WIDTH = 5;
const ROUND_RADIUS_RATIO = 0.15;

const insetRect = (inset: number, width: number, height: number, extra: SvgAttrs): SvgNode =>
  svgNode("rect", { x: inset, y: inset, width: width - inset * 2, height: height - inset * 2, ...extra });

export const frameNodes = (layer: ShapeLayer, styleAttrs: SvgAttrs): SvgNode[] => {
  const width = layer.width;
  const height = layer.height;
  const paint = { fill: "none", stroke: layer.fill || layer.stroke, ...styleAttrs };
  switch (layer.shapeType) {
    case "frame-thin":
      return [insetRect(THIN_WIDTH, width, height, { ...paint, strokeWidth: THIN_WIDTH })];
    case "frame-thick": {
      const thickness = Math.min(width, height) * THICK_RATIO;
      return [insetRect(thickness / 2, width, height, { ...paint, strokeWidth: thickness })];
    }
    case "frame-double":
      return [
        insetRect(DOUBLE_OUTER / 2, width, height, { ...paint, strokeWidth: DOUBLE_WIDTH }),
        insetRect(DOUBLE_INNER, width, height, { ...paint, strokeWidth: DOUBLE_WIDTH }),
      ];
    case "frame-round": {
      const radius = Math.min(width, height) * ROUND_RADIUS_RATIO;
      return [insetRect(ROUND_WIDTH / 2, width, height, { rx: radius, ry: radius, ...paint, strokeWidth: ROUND_WIDTH })];
    }
    default:
      return [];
  }
};

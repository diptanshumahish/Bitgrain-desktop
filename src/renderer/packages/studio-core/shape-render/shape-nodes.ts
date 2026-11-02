import type { ShapeLayer } from "../model/studio-types";
import { hasVisibleStroke } from "../layers/visible-stroke";
import { compactAttrs, type SvgAttrs, type SvgNode } from "./svg-node/svg-node";
import { closedGeometry } from "./geometry/closed-geometry";
import { frameNodes } from "./geometry/frame-nodes";
import { lineNodes } from "./geometry/line-nodes";
import { resolveDashArray } from "./stroke/dash-array";
import { alignedStroke } from "./stroke/stroke-align";
import { gradientPaint, type PaintResult } from "./paint/gradient-paint";

const OUTSIDE_PAD_RATIO = 4;
const CENTER_PAD_RATIO = 2;
const MIN_LINE_WIDTH = 2;

interface ShapeRender {
  defs: SvgNode[];
  body: SvgNode[];
  pad: number;
}

const isLineShape = (layer: ShapeLayer): boolean => layer.shapeType === "line" || layer.shapeType === "arrow";

const isFrameShape = (layer: ShapeLayer): boolean => layer.shapeType.startsWith("frame");

export const strokeStyleAttrs = (layer: ShapeLayer, strokeWidth: number): SvgAttrs =>
  compactAttrs({
    strokeLinecap: layer.lineCap,
    strokeLinejoin: layer.lineJoin,
    strokeDasharray: resolveDashArray(layer.dashStyle, layer.dashPattern, strokeWidth),
  });

const fillPaint = (layer: ShapeLayer, idBase: string): PaintResult => {
  if (!layer.fillGradient) return { defs: [], fill: layer.fill };
  const box = { width: layer.width, height: layer.height };
  return gradientPaint(layer.fillGradient, `${idBase}-fill`, box, box);
};

const strokePad = (layer: ShapeLayer, strokeWidth: number): number => {
  if (layer.strokeAlign === "outside") return strokeWidth * OUTSIDE_PAD_RATIO;
  if (layer.strokeAlign === "center") return strokeWidth * CENTER_PAD_RATIO;
  return 0;
};

const closedShape = (layer: ShapeLayer, idBase: string, strokeWidth: number): ShapeRender => {
  const inset = layer.strokeAlign ? 0 : strokeWidth / 2;
  const geometry = closedGeometry(layer, inset);
  if (!geometry) return { defs: [], body: [], pad: 0 };
  const paint = fillPaint(layer, idBase);
  const stroked = alignedStroke({
    geometry,
    align: layer.strokeAlign ?? "center",
    idBase,
    fillAttrs: { fill: paint.fill },
    strokeAttrs: { stroke: layer.stroke, ...strokeStyleAttrs(layer, strokeWidth) },
    strokeWidth,
  });
  return { defs: [...paint.defs, ...stroked.defs], body: stroked.body, pad: strokePad(layer, strokeWidth) };
};

export const buildShapeRender = (layer: ShapeLayer, idBase: string): ShapeRender => {
  const strokeWidth = hasVisibleStroke(layer.stroke) ? layer.strokeWidth : 0;
  if (isFrameShape(layer)) {
    return { defs: [], body: frameNodes(layer, strokeStyleAttrs(layer, strokeWidth)), pad: 0 };
  }
  if (isLineShape(layer)) {
    const line = lineNodes(layer, strokeWidth, strokeStyleAttrs(layer, Math.max(strokeWidth, MIN_LINE_WIDTH)));
    return { defs: [], body: line.nodes, pad: line.pad };
  }
  return closedShape(layer, idBase, strokeWidth);
};

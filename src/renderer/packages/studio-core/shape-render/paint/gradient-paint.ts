import type { PaintGradient } from "../../model/paint-types";
import { svgNode, type SvgNode } from "../svg-node/svg-node";
import { rgbHex } from "./color-parse";
import { gradientAxes, gradientExtent, gradientMatrix, type BoxSize } from "./gradient-matrix";
import { resolveStops, type ResolvedStop } from "./gradient-stops";
import { angularContent, diamondContent, patternWrapper } from "./gradient-pattern";

const DIGITS = 4;

export interface PaintResult {
  defs: SvgNode[];
  fill: string;
}

const num = (value: number): number => Number(value.toFixed(DIGITS));

const stopNodes = (stops: ResolvedStop[]): SvgNode[] =>
  stops.map((stop) =>
    svgNode("stop", { offset: num(stop.pos), stopColor: rgbHex(stop.rgba), stopOpacity: stop.rgba.a < 1 ? num(stop.rgba.a) : undefined }),
  );

const solidFallback = (stops: ResolvedStop[]): PaintResult => {
  const last = stops[stops.length - 1];
  if (!last) return { defs: [], fill: "none" };
  const { r, g, b, a } = last.rgba;
  return { defs: [], fill: `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${num(a)})` };
};

const nativeGradient = (gradient: PaintGradient, id: string, matrix: string, stops: ResolvedStop[]): SvgNode => {
  const common = { id, gradientUnits: "userSpaceOnUse", gradientTransform: matrix };
  if (gradient.kind === "radial") return svgNode("radialGradient", { ...common, cx: 0, cy: 0, r: 1, fx: 0, fy: 0 }, stopNodes(stops));
  return svgNode("linearGradient", { ...common, x1: 0, y1: 0, x2: 1, y2: 0 }, stopNodes(stops));
};

export const gradientPaint = (gradient: PaintGradient, id: string, userBox: BoxSize, pixelBox: BoxSize): PaintResult => {
  const stops = resolveStops(gradient.stops);
  const matrix = gradientMatrix(gradient, userBox, pixelBox);
  if (!matrix || stops.length === 0) return solidFallback(stops);
  const fill = `url(#${id})`;
  if (gradient.kind === "linear" || gradient.kind === "radial") {
    return { defs: [nativeGradient(gradient, id, matrix, stops)], fill };
  }
  const axes = gradientAxes(gradient, pixelBox);
  const far = axes ? gradientExtent(axes, pixelBox) : 1;
  if (gradient.kind === "angular") {
    return { defs: [patternWrapper(id, userBox, matrix, angularContent(stops, far))], fill };
  }
  const diamond = diamondContent(stopNodes(stops), id, far);
  return { defs: [...diamond.defs, patternWrapper(id, userBox, matrix, diamond.nodes)], fill };
};

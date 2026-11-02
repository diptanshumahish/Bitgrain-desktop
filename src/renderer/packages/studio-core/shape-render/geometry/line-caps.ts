import type { LineEndCap } from "../../model/paint-types";
import { svgNode, type SvgNode } from "../svg-node/svg-node";

const HEAD_WIDTH_RATIO = 0.6;
const CAP_STROKE_RATIO = 3;
const CAP_MIN_SIZE = 6;
const CAP_LENGTH_RATIO = 0.25;

interface CapContext {
  tipX: number;
  cy: number;
  direction: number;
  size: number;
  lineWidth: number;
  color: string;
}

export const capSize = (lineWidth: number, width: number, height: number): number =>
  Math.max(CAP_MIN_SIZE, Math.min(width * CAP_LENGTH_RATIO, Math.max(height / 2, lineWidth * CAP_STROKE_RATIO)));

export const capInset = (cap: LineEndCap, size: number, lineWidth: number): number => {
  if (cap === "triangle") return size;
  if (cap === "circle") return size / 2;
  if (cap === "bar") return lineWidth / 2;
  return 0;
};

const arrowCap = (ctx: CapContext): SvgNode => {
  const baseX = ctx.tipX - ctx.direction * ctx.size;
  const half = ctx.size * HEAD_WIDTH_RATIO;
  return svgNode("path", {
    d: `M${baseX},${ctx.cy - half} L${ctx.tipX},${ctx.cy} L${baseX},${ctx.cy + half}`,
    fill: "none",
    stroke: ctx.color,
    strokeWidth: ctx.lineWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  });
};

const triangleCap = (ctx: CapContext): SvgNode => {
  const baseX = ctx.tipX - ctx.direction * ctx.size;
  const half = ctx.size * HEAD_WIDTH_RATIO;
  return svgNode("polygon", {
    points: `${ctx.tipX},${ctx.cy} ${baseX},${ctx.cy - half} ${baseX},${ctx.cy + half}`,
    fill: ctx.color,
  });
};

const circleCap = (ctx: CapContext): SvgNode =>
  svgNode("circle", {
    cx: ctx.tipX - (ctx.direction * ctx.size) / 2,
    cy: ctx.cy,
    r: ctx.size / 2,
    fill: ctx.color,
  });

const barCap = (ctx: CapContext): SvgNode => {
  const x = ctx.tipX - (ctx.direction * ctx.lineWidth) / 2;
  const half = ctx.size * HEAD_WIDTH_RATIO;
  return svgNode("line", {
    x1: x,
    y1: ctx.cy - half,
    x2: x,
    y2: ctx.cy + half,
    stroke: ctx.color,
    strokeWidth: ctx.lineWidth,
    strokeLinecap: "butt",
  });
};

const CAP_BUILDERS: Record<Exclude<LineEndCap, "none">, (ctx: CapContext) => SvgNode> = {
  arrow: arrowCap,
  triangle: triangleCap,
  circle: circleCap,
  bar: barCap,
};

export const capNode = (cap: LineEndCap, ctx: CapContext): SvgNode | null =>
  cap === "none" ? null : CAP_BUILDERS[cap](ctx);

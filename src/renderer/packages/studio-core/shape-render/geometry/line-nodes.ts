import type { ShapeLayer } from "../../model/studio-types";
import type { LineEndCap } from "../../model/paint-types";
import { svgNode, type SvgAttrs, type SvgNode } from "../svg-node/svg-node";
import { capInset, capNode, capSize } from "./line-caps";

const MIN_LINE_WIDTH = 2;
const LEGACY_HEAD_RATIO_W = 0.2;
const LEGACY_HEAD_RATIO_H = 0.5;
const LEGACY_HEAD_MAX = 30;
const LEGACY_HEAD_WIDTH = 0.6;

interface LineRender {
  nodes: SvgNode[];
  pad: number;
}

const legacyLine = (layer: ShapeLayer, visibleWidth: number, color: string, styleAttrs: SvgAttrs): SvgNode => {
  const lineWidth = Math.max(visibleWidth, MIN_LINE_WIDTH);
  const cy = layer.height / 2;
  const width = layer.width;
  if (layer.shapeType === "line") {
    return svgNode("line", { x1: 0, y1: cy, x2: width, y2: cy, stroke: color, strokeWidth: lineWidth, strokeLinecap: "round", ...styleAttrs });
  }
  const inset = visibleWidth / 2;
  const head = Math.min(width * LEGACY_HEAD_RATIO_W, layer.height * LEGACY_HEAD_RATIO_H, LEGACY_HEAD_MAX);
  return svgNode("path", {
    d: `M${inset},${cy} L${width - head},${cy} M${width - head},${cy - head * LEGACY_HEAD_WIDTH} L${width - inset},${cy} L${width - head},${cy + head * LEGACY_HEAD_WIDTH}`,
    fill: "none",
    stroke: color,
    strokeWidth: lineWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...styleAttrs,
  });
};

const tipOffset = (cap: LineEndCap, lineWidth: number): number => (cap === "arrow" ? lineWidth / 2 : 0);

const cappedLine = (layer: ShapeLayer, lineWidth: number, color: string, styleAttrs: SvgAttrs): LineRender => {
  const cy = layer.height / 2;
  const startCap = layer.startCap ?? "none";
  const endCap = layer.endCap ?? (layer.shapeType === "arrow" ? "arrow" : "none");
  const size = capSize(lineWidth, layer.width, layer.height);
  const startTip = tipOffset(startCap, lineWidth);
  const endTip = layer.width - tipOffset(endCap, lineWidth);
  const body = svgNode("line", {
    x1: startTip + capInset(startCap, size, lineWidth),
    y1: cy,
    x2: endTip - capInset(endCap, size, lineWidth),
    y2: cy,
    stroke: color,
    strokeWidth: lineWidth,
    strokeLinecap: "round",
    ...styleAttrs,
  });
  const caps = [
    capNode(startCap, { tipX: startTip, cy, direction: -1, size, lineWidth, color }),
    capNode(endCap, { tipX: endTip, cy, direction: 1, size, lineWidth, color }),
  ].filter((node): node is SvgNode => node !== null);
  return { nodes: [body, ...caps], pad: size + lineWidth };
};

export const lineNodes = (layer: ShapeLayer, visibleWidth: number, styleAttrs: SvgAttrs): LineRender => {
  const color = layer.stroke || layer.fill;
  if (layer.startCap === undefined && layer.endCap === undefined) {
    return { nodes: [legacyLine(layer, visibleWidth, color, styleAttrs)], pad: 0 };
  }
  return cappedLine(layer, Math.max(visibleWidth, MIN_LINE_WIDTH), color, styleAttrs);
};

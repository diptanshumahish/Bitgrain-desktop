import { svgNode, type SvgNode } from "../svg-node/svg-node";
import { rgbHex } from "./color-parse";
import { sampleStops, type ResolvedStop } from "./gradient-stops";
import type { BoxSize } from "./gradient-matrix";

const WEDGE_COUNT = 360;
const WEDGE_OVERLAP_STEPS = 8;
const DIAMOND_TIP = 0.5;
const DIGITS = 4;
const QUADRANT_SIGNS: Array<[number, number]> = [[1, 1], [-1, 1], [-1, -1], [1, -1]];

const num = (value: number): number => Number(value.toFixed(DIGITS));

const wedgeNode = (stops: ResolvedStop[], index: number, far: number): SvgNode => {
  const color = sampleStops(stops, (index + 1 / 2) / WEDGE_COUNT);
  const endIndex = Math.min(WEDGE_COUNT, index + 1 + (color.a >= 1 ? WEDGE_OVERLAP_STEPS : 0));
  const from = (index / WEDGE_COUNT) * Math.PI * 2;
  const to = (endIndex / WEDGE_COUNT) * Math.PI * 2;
  const points = `0,0 ${num(far * Math.cos(from))},${num(far * Math.sin(from))} ${num(far * Math.cos(to))},${num(far * Math.sin(to))}`;
  return svgNode("polygon", { points, fill: rgbHex(color), fillOpacity: color.a < 1 ? num(color.a) : undefined });
};

export const angularContent = (stops: ResolvedStop[], far: number): SvgNode[] =>
  Array.from({ length: WEDGE_COUNT }, (_, index) => wedgeNode(stops, index, far));

export const diamondContent = (stopNodes: SvgNode[], id: string, far: number): { defs: SvgNode[]; nodes: SvgNode[] } => {
  const gradientId = `${id}-quad`;
  const gradient = svgNode(
    "linearGradient",
    { id: gradientId, gradientUnits: "userSpaceOnUse", x1: 0, y1: 0, x2: DIAMOND_TIP, y2: DIAMOND_TIP },
    stopNodes,
  );
  const nodes = QUADRANT_SIGNS.map(([signX, signY]) =>
    svgNode("polygon", {
      points: `0,0 ${far},0 ${far},${far} 0,${far}`,
      transform: `scale(${signX} ${signY})`,
      fill: `url(#${gradientId})`,
    }),
  );
  return { defs: [gradient], nodes };
};

export const patternWrapper = (id: string, box: BoxSize, matrix: string, content: SvgNode[]): SvgNode =>
  svgNode(
    "pattern",
    { id, patternUnits: "userSpaceOnUse", x: 0, y: 0, width: box.width, height: box.height },
    [svgNode("g", { transform: matrix, shapeRendering: "crispEdges" }, content)],
  );

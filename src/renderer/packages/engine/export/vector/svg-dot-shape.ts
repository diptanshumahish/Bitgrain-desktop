import type { HalftoneShape } from "../../plugins/halftone/halftone-defaults";
import { SHAPE_ELLIPSE_ASPECT } from "../../plugins/halftone/dot-shapes";
import { formatSvgNumber } from "./svg-format";

export interface SvgShapeStyle {
  cap: "round" | "square" | "butt";
  wrapTransform: string;
  strokeScale: number;
  stroke: string;
  mapPoint: (col: number, row: number) => [number, number];
}

const DIAMOND_TURN = 45;
const COS_TURN = Math.SQRT1_2;
const DIAMOND_SIDE_PER_REACH = Math.SQRT2 / 2;

const identityPoint = (col: number, row: number): [number, number] => [col, row];

const unturnPoint = (col: number, row: number): [number, number] => [
  (col + row) * COS_TURN,
  (row - col) * COS_TURN,
];

export const svgShapeStyle = (shape: HalftoneShape): SvgShapeStyle => {
  switch (shape) {
    case "square":
      return { cap: "square", wrapTransform: "", strokeScale: 1, stroke: "h0", mapPoint: identityPoint };
    case "diamond":
      return { cap: "square", wrapTransform: `rotate(${DIAMOND_TURN})`, strokeScale: DIAMOND_SIDE_PER_REACH, stroke: "h0", mapPoint: unturnPoint };
    case "ellipse":
      return {
        cap: "round",
        wrapTransform: `scale(1 ${formatSvgNumber(1 / SHAPE_ELLIPSE_ASPECT)})`,
        strokeScale: 1,
        stroke: "h0",
        mapPoint: (col, row) => [col, row * SHAPE_ELLIPSE_ASPECT],
      };
    case "line":
      return { cap: "butt", wrapTransform: "", strokeScale: 1, stroke: "h1", mapPoint: (col, row) => [col - 0.5, row] };
    default:
      return { cap: "round", wrapTransform: "", strokeScale: 1, stroke: "h0", mapPoint: identityPoint };
  }
};

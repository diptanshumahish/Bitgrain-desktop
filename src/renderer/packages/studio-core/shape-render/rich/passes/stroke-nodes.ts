import type { LayerStroke } from "../../../model/layer-paint-types";
import type { SvgAttrs, SvgNode } from "../../svg-node/svg-node";
import { strokeAlignment, withAttrs } from "../../stroke/stroke-align";
import { partialOpacity, splitColor } from "./fill-passes";

const OUTSIDE_PAD_RATIO = 4;
const CENTER_PAD_RATIO = 2;

interface StrokeNodesInput {
  geometry: SvgNode;
  strokes: LayerStroke[];
  idBase: string;
  closed: boolean;
  styleFor: (width: number) => SvgAttrs;
}

interface StrokeNodesResult {
  defs: SvgNode[];
  nodes: SvgNode[];
  pad: number;
}

const strokePad = (stroke: LayerStroke, closed: boolean): number => {
  if (!closed || stroke.align === "center") return stroke.width * CENTER_PAD_RATIO;
  return stroke.align === "outside" ? stroke.width * OUTSIDE_PAD_RATIO : 0;
};

export const strokeNodes = ({ geometry, strokes, idBase, closed, styleFor }: StrokeNodesInput): StrokeNodesResult => {
  const built = strokes.map((stroke, index) => {
    const alignment = strokeAlignment(geometry, closed ? stroke.align : "center", `${idBase}-s${index}`);
    const paint = splitColor(stroke.color, stroke.opacity);
    const node = withAttrs(geometry, {
      ...styleFor(stroke.width),
      fill: "none",
      stroke: paint.color,
      strokeOpacity: partialOpacity(paint.opacity),
      strokeWidth: stroke.width * alignment.widthFactor,
      ...alignment.attrs,
    });
    return { defs: alignment.defs, node };
  });
  return {
    defs: built.flatMap((entry) => entry.defs),
    nodes: built.map((entry) => entry.node),
    pad: Math.max(0, ...strokes.map((stroke) => strokePad(stroke, closed))),
  };
};

import type { StrokeAlign } from "../../model/paint-types";
import { svgNode, type SvgAttrs, type SvgNode } from "../svg-node/svg-node";

const MASK_EXTENT = 100000;
const ALIGNED_WIDTH_FACTOR = 2;

export interface StrokeAlignment {
  defs: SvgNode[];
  attrs: SvgAttrs;
  widthFactor: number;
  split: boolean;
}

interface AlignedStrokeInput {
  geometry: SvgNode;
  align: StrokeAlign;
  idBase: string;
  fillAttrs: SvgAttrs;
  strokeAttrs: SvgAttrs;
  strokeWidth: number;
}

interface AlignedStrokeOutput {
  defs: SvgNode[];
  body: SvgNode[];
}

export const withAttrs = (geometry: SvgNode, attrs: SvgAttrs): SvgNode => ({
  ...geometry,
  attrs: { ...geometry.attrs, ...attrs },
});

const outsideMask = (geometry: SvgNode, id: string): SvgNode =>
  svgNode("mask", { id, maskUnits: "userSpaceOnUse", x: -MASK_EXTENT, y: -MASK_EXTENT, width: MASK_EXTENT * 2, height: MASK_EXTENT * 2 }, [
    svgNode("rect", { x: -MASK_EXTENT, y: -MASK_EXTENT, width: MASK_EXTENT * 2, height: MASK_EXTENT * 2, fill: "#ffffff" }),
    withAttrs(geometry, { fill: "#000000", stroke: "none" }),
  ]);

export const strokeAlignment = (geometry: SvgNode, align: StrokeAlign, idBase: string): StrokeAlignment => {
  if (align === "inside") {
    const clipId = `${idBase}-clip`;
    return {
      defs: [svgNode("clipPath", { id: clipId }, [withAttrs(geometry, {})])],
      attrs: { clipPath: `url(#${clipId})` },
      widthFactor: ALIGNED_WIDTH_FACTOR,
      split: true,
    };
  }
  if (align === "outside") {
    const maskId = `${idBase}-mask`;
    return { defs: [outsideMask(geometry, maskId)], attrs: { mask: `url(#${maskId})` }, widthFactor: ALIGNED_WIDTH_FACTOR, split: true };
  }
  return { defs: [], attrs: {}, widthFactor: 1, split: false };
};

export const alignedStroke = (input: AlignedStrokeInput): AlignedStrokeOutput => {
  const { geometry, align, idBase, fillAttrs, strokeAttrs, strokeWidth } = input;
  if (strokeWidth <= 0) {
    return { defs: [], body: [withAttrs(geometry, { ...fillAttrs, ...strokeAttrs, stroke: "none", strokeWidth })] };
  }
  const alignment = strokeAlignment(geometry, align, idBase);
  if (!alignment.split) {
    return { defs: [], body: [withAttrs(geometry, { ...fillAttrs, ...strokeAttrs, strokeWidth })] };
  }
  const fillNode = withAttrs(geometry, { ...fillAttrs, stroke: "none" });
  const strokeNode = withAttrs(geometry, {
    ...strokeAttrs,
    fill: "none",
    strokeWidth: strokeWidth * alignment.widthFactor,
    ...alignment.attrs,
  });
  return { defs: alignment.defs, body: [fillNode, strokeNode] };
};

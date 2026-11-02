import type { VectorLayer } from "../model/studio-types";
import { svgNode, type SvgNode } from "./svg-node/svg-node";
import { gradientPaint } from "./paint/gradient-paint";
import type { BoxSize } from "./paint/gradient-matrix";
import { strokeAlignment, type StrokeAlignment } from "./stroke/stroke-align";
import { resolveDashArray } from "./stroke/dash-array";

interface VectorPaint {
  defs: SvgNode[];
  gradientFill: string | null;
  alignment: StrokeAlignment;
}

interface VectorPaintInput {
  layer: VectorLayer;
  d: string;
  idBase: string;
  userBox: BoxSize;
  pixelBox: BoxSize;
}

const NO_ALIGNMENT: StrokeAlignment = { defs: [], attrs: {}, widthFactor: 1, split: false };

export const vectorPaint = ({ layer, d, idBase, userBox, pixelBox }: VectorPaintInput): VectorPaint => {
  const closed = layer.path.closed;
  const gradient = closed && !layer.fillImage && layer.fillGradient
    ? gradientPaint(layer.fillGradient, `${idBase}-fill`, userBox, pixelBox)
    : null;
  const aligned = closed && layer.strokeWidth > 0 && layer.strokeAlign && layer.strokeAlign !== "center";
  const alignment = aligned ? strokeAlignment(svgNode("path", { d }), layer.strokeAlign ?? "center", idBase) : NO_ALIGNMENT;
  return {
    defs: [...(gradient?.defs ?? []), ...alignment.defs],
    gradientFill: gradient?.fill ?? null,
    alignment,
  };
};

export const vectorDashArray = (layer: VectorLayer, strokeWidth: number, unitScale: number): string | undefined => {
  const pattern = layer.dashPattern ? ([layer.dashPattern[0] * unitScale, layer.dashPattern[1] * unitScale] as [number, number]) : undefined;
  return resolveDashArray(layer.dashStyle, pattern, strokeWidth);
};

import type { InkLayer, ShapeLayer, VectorFillFit, VectorLayer } from "@bitgrain/studio-core/model/studio-types";
import { buildShapeRender } from "@bitgrain/studio-core/shape-render/shape-nodes";
import { vectorDashArray, vectorPaint } from "@bitgrain/studio-core/shape-render/vector-paint";
import { compactAttrs, svgNode, type SvgNode } from "@bitgrain/studio-core/shape-render/svg-node/svg-node";
import { vectorPathToD } from "@bitgrain/studio-core/geometry/vector-utils";
import { scaleVectorPath } from "@bitgrain/studio-core/geometry/scale-vector-path";
import { scopedId, type ExportNodeContext } from "./layer-frame";

const VIEWBOX_SIZE = 100;

const withDefs = (defs: SvgNode[], body: SvgNode[]): SvgNode[] => (defs.length > 0 ? [svgNode("defs", {}, defs), ...body] : body);

export const shapeNodes = (layer: ShapeLayer, ctx: ExportNodeContext): SvgNode[] => {
  const render = buildShapeRender(layer, scopedId(ctx, layer, "shp"));
  return withDefs(render.defs, render.body);
};

const aspectFor = (fit: VectorFillFit): string => {
  if (fit === "stretch") return "none";
  return fit === "cover" ? "xMidYMid slice" : "xMidYMid meet";
};

const fillImagePattern = (layer: VectorLayer, id: string): SvgNode[] => {
  if (!layer.fillImage) return [];
  const size = { width: layer.width, height: layer.height };
  const image = svgNode("image", { href: layer.fillImage.src, x: 0, y: 0, ...size, preserveAspectRatio: aspectFor(layer.fillImage.fit) });
  return [svgNode("pattern", { id, x: 0, y: 0, ...size, patternUnits: "userSpaceOnUse" }, [image])];
};

const vectorStrokeAttrs = (layer: VectorLayer, width: number): Record<string, string | number | undefined> => ({
  stroke: layer.strokeWidth > 0 ? layer.strokeColor : "none",
  strokeWidth: layer.strokeWidth > 0 ? width : undefined,
  strokeLinecap: layer.lineCap,
  strokeLinejoin: layer.lineJoin,
  strokeDasharray: vectorDashArray(layer, layer.strokeWidth, 1),
});

export const vectorNodes = (layer: VectorLayer, ctx: ExportNodeContext): SvgNode[] => {
  const d = vectorPathToD(scaleVectorPath(layer.path, layer.width / VIEWBOX_SIZE, layer.height / VIEWBOX_SIZE));
  const box = { width: layer.width, height: layer.height };
  const patternId = scopedId(ctx, layer, "vfill");
  const paint = vectorPaint({ layer, d, idBase: scopedId(ctx, layer, "vec"), userBox: box, pixelBox: box });
  const fill = !layer.path.closed ? "none" : layer.fillImage ? `url(#${patternId})` : paint.gradientFill ?? layer.fill;
  const strokeWidth = layer.strokeWidth * paint.alignment.widthFactor;
  const defs = [...fillImagePattern(layer, patternId), ...paint.defs];
  const alignAttrs = { clipPath: paint.alignment.attrs.clipPath, mask: paint.alignment.attrs.mask };
  const body = paint.alignment.split
    ? [svgNode("path", { d, fill, stroke: "none" }), svgNode("path", compactAttrs({ d, fill: "none", ...vectorStrokeAttrs(layer, strokeWidth), ...alignAttrs }))]
    : [svgNode("path", compactAttrs({ d, fill, ...vectorStrokeAttrs(layer, strokeWidth) }))];
  return withDefs(defs, body);
};

export const inkNodes = (layer: InkLayer): SvgNode[] => {
  const paths = layer.strokes.map((stroke) => svgNode("path", { d: stroke.d, fill: layer.color }));
  const viewBox = `0 0 ${layer.viewW} ${layer.viewH}`;
  return [svgNode("svg", { x: 0, y: 0, width: layer.width, height: layer.height, viewBox, preserveAspectRatio: "none", overflow: "visible" }, paths)];
};

import type { BezierAnchor, VectorLayer } from "../../model/studio-types";
import { compactAttrs, svgNode } from "../svg-node/svg-node";
import { vectorDashArray } from "../vector-paint";
import { visibleFills, visibleStrokes } from "../paint-list/read-paints";
import { fillPasses } from "./passes/fill-passes";
import { strokeNodes } from "./passes/stroke-nodes";
import { composeRich } from "./passes/compose-rich";
import type { PaintBox, RichRender } from "./rich-types";
import { vectorPathToD } from "../../geometry/vector-utils";
import { scaleVectorPath } from "../../geometry/scale-vector-path";

const VIEWBOX_SIZE = 100;

const anchorPoints = (anchor: BezierAnchor): Array<{ x: number; y: number }> =>
  [anchor, anchor.inHandle, anchor.outHandle].filter((point): point is { x: number; y: number } => Boolean(point));

const pathOverflow = (layer: VectorLayer, box: PaintBox): number => {
  const points = [layer.path.anchors, ...(layer.path.extraRings ?? [])].flat().flatMap(anchorPoints);
  const scaleX = box.width / VIEWBOX_SIZE;
  const scaleY = box.height / VIEWBOX_SIZE;
  const overflows = points.map((point) =>
    Math.max(-point.x * scaleX, -point.y * scaleY, point.x * scaleX - box.width, point.y * scaleY - box.height),
  );
  return Math.max(0, ...overflows);
};

const vectorPixelD = (layer: VectorLayer): string =>
  vectorPathToD(scaleVectorPath(layer.path, layer.width / VIEWBOX_SIZE, layer.height / VIEWBOX_SIZE));

export const buildVectorRich = (layer: VectorLayer, idBase: string): RichRender => {
  const box = { width: layer.width, height: layer.height };
  const geometry = svgNode("path", { d: vectorPixelD(layer) });
  const closed = layer.path.closed;
  const strokes = strokeNodes({
    geometry,
    strokes: visibleStrokes(layer),
    idBase,
    closed,
    styleFor: (width) => compactAttrs({
      strokeLinecap: layer.lineCap,
      strokeLinejoin: layer.lineJoin,
      strokeDasharray: vectorDashArray(layer, width, 1),
    }),
  });
  const fills = closed ? fillPasses(geometry, visibleFills(layer), idBase, box) : { defs: [], passes: [], silhouette: [] };
  return composeRich({
    ...box,
    idBase,
    fills,
    strokeDefs: strokes.defs,
    strokeNodes: strokes.nodes,
    contentPad: strokes.pad + pathOverflow(layer, box),
    effects: layer.layerEffects,
  });
};

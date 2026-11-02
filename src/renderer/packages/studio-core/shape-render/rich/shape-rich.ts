import type { ShapeLayer } from "../../model/studio-types";
import { buildShapeRender, strokeStyleAttrs } from "../shape-nodes";
import { closedGeometry } from "../geometry/closed-geometry";
import { visibleFills, visibleStrokes } from "../paint-list/read-paints";
import { isClosedShape } from "../../shapes/shape-kinds";
import { fillPasses } from "./passes/fill-passes";
import { strokeNodes } from "./passes/stroke-nodes";
import { composeRich } from "./passes/compose-rich";
import type { RichRender } from "./rich-types";

const legacyBodyRich = (layer: ShapeLayer, idBase: string): RichRender => {
  const legacy = buildShapeRender(layer, idBase);
  const fills = { defs: legacy.defs, passes: [{ kind: "svg" as const, nodes: legacy.body }], silhouette: legacy.body };
  return composeRich({
    width: layer.width,
    height: layer.height,
    idBase,
    fills,
    strokeDefs: [],
    strokeNodes: [],
    contentPad: legacy.pad,
    effects: layer.layerEffects,
  });
};

export const buildShapeRich = (layer: ShapeLayer, idBase: string): RichRender => {
  const geometry = isClosedShape(layer.shapeType) ? closedGeometry(layer, 0) : null;
  if (!geometry) return legacyBodyRich(layer, idBase);
  const box = { width: layer.width, height: layer.height };
  const strokes = strokeNodes({
    geometry,
    strokes: visibleStrokes(layer),
    idBase,
    closed: true,
    styleFor: (width) => strokeStyleAttrs(layer, width),
  });
  return composeRich({
    ...box,
    idBase,
    fills: fillPasses(geometry, visibleFills(layer), idBase, box),
    strokeDefs: strokes.defs,
    strokeNodes: strokes.nodes,
    contentPad: strokes.pad,
    effects: layer.layerEffects,
  });
};

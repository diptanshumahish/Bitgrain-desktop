import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { hasRichPaint } from "@bitgrain/studio-core/shape-render/rich/has-rich-paint";
import { buildShapeRich } from "@bitgrain/studio-core/shape-render/rich/shape-rich";
import { buildVectorRich } from "@bitgrain/studio-core/shape-render/rich/vector-rich";

export const maskEffectPad = (layer: Layer): number => {
  if (layer.type === "shape" && hasRichPaint(layer)) return buildShapeRich(layer, "mask-pad").margin;
  if (layer.type === "vector" && hasRichPaint(layer)) return buildVectorRich(layer, "mask-pad").margin;
  return 0;
};

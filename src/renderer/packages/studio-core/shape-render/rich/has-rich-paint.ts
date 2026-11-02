import type { ShapeLayer, VectorLayer } from "../../model/studio-types";
import { visibleEffects } from "../paint-list/read-paints";

export const hasRichPaint = (layer: ShapeLayer | VectorLayer): boolean =>
  Boolean(layer.fills || layer.strokes || visibleEffects(layer.layerEffects).length > 0);

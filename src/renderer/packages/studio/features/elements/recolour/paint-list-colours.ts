import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { LayerFill, LayerStroke } from "@bitgrain/studio-core/model/layer-paint-types";
import { normalizeHex } from "./normalize-hex";

type ColouredPaint = LayerFill | LayerStroke;

interface PaintListsPatch {
  fills?: LayerFill[];
  strokes?: LayerStroke[];
}

const hasPaintLists = (layer: Layer): layer is Extract<Layer, { type: "shape" | "vector" }> =>
  layer.type === "shape" || layer.type === "vector";

const solidFills = (fills: LayerFill[] | undefined): LayerFill[] => (fills ?? []).filter((fill) => fill.kind === "solid");

export const paintListsOf = (layer: Layer): ColouredPaint[][] =>
  hasPaintLists(layer) ? [solidFills(layer.fills), layer.strokes ?? []] : [];

const swapPaint = <T extends ColouredPaint>(paint: T, swaps: Map<string, string>): T => {
  const hex = normalizeHex(paint.color);
  const next = hex ? swaps.get(hex) : undefined;
  return next === undefined ? paint : { ...paint, color: next };
};

export const recolourPaintLists = (layer: Layer, swaps: Map<string, string>): PaintListsPatch => {
  if (!hasPaintLists(layer)) return {};
  const patch: PaintListsPatch = {};
  if (layer.fills) patch.fills = layer.fills.map((fill) => (fill.kind === "solid" ? swapPaint(fill, swaps) : fill));
  if (layer.strokes) patch.strokes = layer.strokes.map((stroke) => swapPaint(stroke, swaps));
  return patch;
};

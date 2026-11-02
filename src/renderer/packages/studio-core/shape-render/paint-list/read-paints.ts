import type { ShapeLayer, VectorLayer } from "../../model/studio-types";
import type { LayerEffect, LayerFill, LayerStroke } from "../../model/layer-paint-types";
import type { StrokeAlign } from "../../model/paint-types";
import { hasVisibleStroke } from "../../layers/visible-stroke";

const LEGACY_FILL_ID = "fill-0";
const LEGACY_STROKE_ID = "stroke-0";

type PaintedLayer = ShapeLayer | VectorLayer;

const isEmptyColor = (color: string | undefined): boolean => !hasVisibleStroke(color);

const legacyFill = (layer: PaintedLayer): LayerFill | null => {
  const base = { id: LEGACY_FILL_ID, color: layer.fill, opacity: 1, visible: true };
  if (layer.type === "vector" && layer.fillImage) return { ...base, kind: "image", image: layer.fillImage };
  if (layer.fillGradient) return { ...base, kind: "gradient", gradient: layer.fillGradient };
  if (isEmptyColor(layer.fill)) return null;
  return { ...base, kind: "solid" };
};

export const readFills = (layer: PaintedLayer): LayerFill[] => {
  if (layer.fills) return layer.fills;
  const fill = legacyFill(layer);
  return fill ? [fill] : [];
};

const legacyStrokeColor = (layer: PaintedLayer): string => (layer.type === "vector" ? layer.strokeColor : layer.stroke);

export const legacyStrokeAlign = (layer: PaintedLayer): StrokeAlign => {
  if (layer.strokeAlign) return layer.strokeAlign;
  return layer.type === "vector" ? "center" : "inside";
};

export const readStrokes = (layer: PaintedLayer): LayerStroke[] => {
  if (layer.strokes) return layer.strokes;
  const color = legacyStrokeColor(layer);
  if (isEmptyColor(color) || layer.strokeWidth <= 0) return [];
  return [{ id: LEGACY_STROKE_ID, color, width: layer.strokeWidth, align: legacyStrokeAlign(layer), opacity: 1, visible: true }];
};

export const visibleFills = (layer: PaintedLayer): LayerFill[] => readFills(layer).filter((fill) => fill.visible);

export const visibleStrokes = (layer: PaintedLayer): LayerStroke[] =>
  readStrokes(layer).filter((stroke) => stroke.visible && stroke.width > 0 && !isEmptyColor(stroke.color));

export const visibleEffects = (effects: LayerEffect[] | undefined): LayerEffect[] =>
  (effects ?? []).filter((effect) => effect.visible);

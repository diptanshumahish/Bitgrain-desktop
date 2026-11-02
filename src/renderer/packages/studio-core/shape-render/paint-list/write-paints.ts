import type { ShapeLayer, VectorLayer } from "../../model/studio-types";
import type { LayerFill, LayerStroke } from "../../model/layer-paint-types";
import { legacyStrokeAlign } from "./read-paints";

const EMPTY_COLOR = "transparent";

const isPlain = (paint: { visible: boolean; opacity: number }): boolean => paint.visible && paint.opacity >= 1;

const isLegacyFill = (fill: LayerFill, allowImage: boolean): boolean => {
  if (!isPlain(fill) || (fill.blendMode && fill.blendMode !== "normal")) return false;
  if (fill.kind === "image") return allowImage && Boolean(fill.image);
  if (fill.kind === "gradient") return Boolean(fill.gradient);
  return fill.kind === "solid";
};

const topSolidColor = (fills: LayerFill[]): string => {
  const solid = [...fills].reverse().find((fill) => fill.visible && fill.kind === "solid");
  return solid?.color ?? EMPTY_COLOR;
};

const fillVarFor = <T extends ShapeLayer | VectorLayer>(layer: T, color: string): string | undefined =>
  color === layer.fill ? layer.fillVar : undefined;

export const shapeFillsPatch = (layer: ShapeLayer, fills: LayerFill[]): Partial<ShapeLayer> => {
  const only = fills.length === 1 ? fills[0] : null;
  if (fills.length === 0) return { fills: undefined, fill: EMPTY_COLOR, fillVar: undefined, fillGradient: undefined };
  if (only && isLegacyFill(only, false)) {
    return { fills: undefined, fill: only.color, fillVar: fillVarFor(layer, only.color), fillGradient: only.kind === "gradient" ? only.gradient : undefined };
  }
  const color = topSolidColor(fills);
  return { fills, fill: color, fillVar: fillVarFor(layer, color), fillGradient: undefined };
};

export const vectorFillsPatch = (layer: VectorLayer, fills: LayerFill[]): Partial<VectorLayer> => {
  const only = fills.length === 1 ? fills[0] : null;
  const cleared = { fillGradient: undefined, fillImage: undefined };
  if (fills.length === 0) return { ...cleared, fills: undefined, fill: EMPTY_COLOR, fillVar: undefined };
  if (only && isLegacyFill(only, true)) {
    return {
      ...cleared,
      fills: undefined,
      fill: only.color,
      fillVar: fillVarFor(layer, only.color),
      fillGradient: only.kind === "gradient" ? only.gradient : undefined,
      fillImage: only.kind === "image" ? only.image : undefined,
    };
  }
  const color = topSolidColor(fills);
  return { ...cleared, fills, fill: color, fillVar: fillVarFor(layer, color) };
};

interface StrokeLegacy {
  strokes: LayerStroke[] | undefined;
  color: string;
  width: number;
  align: LayerStroke["align"] | undefined;
}

const strokeLegacy = (layer: ShapeLayer | VectorLayer, strokes: LayerStroke[]): StrokeLegacy => {
  const only = strokes.length === 1 && isPlain(strokes[0]) ? strokes[0] : null;
  if (only) {
    const keepDefault = !layer.strokeAlign && only.align === legacyStrokeAlign(layer);
    return { strokes: undefined, color: only.color, width: only.width, align: keepDefault ? undefined : only.align };
  }
  const top = [...strokes].reverse().find((stroke) => stroke.visible);
  return { strokes: strokes.length > 0 ? strokes : undefined, color: top?.color ?? EMPTY_COLOR, width: top?.width ?? 0, align: top?.align ?? layer.strokeAlign };
};

export const shapeStrokesPatch = (layer: ShapeLayer, strokes: LayerStroke[]): Partial<ShapeLayer> => {
  const legacy = strokeLegacy(layer, strokes);
  return {
    strokes: legacy.strokes,
    stroke: legacy.color,
    strokeVar: legacy.color === layer.stroke ? layer.strokeVar : undefined,
    strokeWidth: legacy.width,
    strokeAlign: legacy.align,
  };
};

export const vectorStrokesPatch = (layer: VectorLayer, strokes: LayerStroke[]): Partial<VectorLayer> => {
  const legacy = strokeLegacy(layer, strokes);
  return {
    strokes: legacy.strokes,
    strokeColor: legacy.color,
    strokeColorVar: legacy.color === layer.strokeColor ? layer.strokeColorVar : undefined,
    strokeWidth: legacy.width,
    strokeAlign: legacy.align,
  };
};

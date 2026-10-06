import type { Layer, TextLayer, TemplatePage } from "../../../data/studioTypes";
import type { TextStyleVariable, NumberToken } from "../../../data/design-kit-types";

const LINE_SHAPES: ReadonlySet<string> = new Set(["line", "arrow"]);

export const colorBindUpdateForLayer = (
  layer: Layer,
  varId: string,
  hex: string,
): Partial<Layer> | null => {
  switch (layer.type) {
    case "text":
      return { color: hex, colorVar: varId };
    case "shape":
      return LINE_SHAPES.has(layer.shapeType) ? { stroke: hex, strokeVar: varId } : { fill: hex, fillVar: varId };
    case "vector":
      return { fill: hex, fillVar: varId };
    case "ink":
      return { color: hex, colorVar: varId };
    default:
      return null;
  }
};

const COLOR_SLOTS: Partial<Record<Layer["type"], Array<[string, string]>>> = {
  text: [["colorVar", "color"]],
  shape: [["fillVar", "fill"], ["strokeVar", "stroke"]],
  vector: [["fillVar", "fill"], ["strokeColorVar", "strokeColor"]],
  ink: [["colorVar", "color"]],
};

const resyncLayer = (layer: Layer, varId: string, hex: string): Layer => {
  let next = layer;
  for (const [varField, colorField] of COLOR_SLOTS[layer.type] ?? []) {
    if ((next as unknown as Record<string, unknown>)[varField] === varId) {
      next = { ...next, [colorField]: hex } as Layer;
    }
  }
  if (next.type === "group") {
    next = { ...next, layers: next.layers.map((child) => resyncLayer(child, varId, hex)) } as Layer;
  } else if (next.type === "frame") {
    const rebased = next.backgroundVar === varId ? { ...next, background: hex } : next;
    next = {
      ...rebased,
      layers: rebased.layers.map((child) => resyncLayer(child, varId, hex)),
    } as Layer;
  }
  return next;
};

export const resyncVarInPages = (
  pages: TemplatePage[],
  varId: string,
  hex: string,
): TemplatePage[] =>
  pages.map((page) => ({
    ...page,
    background: page.backgroundVar === varId ? hex : page.background,
    layers: page.layers.map((layer) => resyncLayer(layer, varId, hex)),
  }));

export const styleFromTextLayer = (
  layer: TextLayer,
): Omit<TextStyleVariable, "id" | "name"> => ({
  fontFamily: layer.fontFamily,
  fontWeight: layer.fontWeight,
  fontSize: layer.fontSize,
  lineHeight: layer.lineHeight,
  letterSpacing: layer.letterSpacing,
  textTransform: layer.textTransform,
  fontStyle: layer.fontStyle,
});

export const textStyleUpdate = (style: TextStyleVariable): Partial<TextLayer> => ({
  fontFamily: style.fontFamily,
  fontWeight: style.fontWeight,
  fontSize: style.fontSize,
  lineHeight: style.lineHeight,
  letterSpacing: style.letterSpacing,
  textTransform: style.textTransform,
  fontStyle: style.fontStyle,
});

export const numberUpdateForLayer = (
  layer: Layer,
  token: NumberToken,
): Partial<Layer> | null => {
  switch (token.kind) {
    case "radius":
      if (layer.type === "shape" || layer.type === "upload") return { borderRadius: token.value };
      return null;
    case "strokeWidth":
      if (layer.type === "shape" || layer.type === "vector") return { strokeWidth: token.value };
      return null;
    case "fontSize":
      if (layer.type === "text") return { fontSize: token.value };
      return null;
    case "spacing":
      if (layer.type === "group") return { gap: token.value };
      return null;
    default:
      return null;
  }
};

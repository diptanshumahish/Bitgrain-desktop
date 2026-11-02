import type { Layer, LayerType } from "@bitgrain/studio-core/model/studio-types";

export type LayerStyle = Record<string, unknown>;

export interface CopiedLayerStyle {
  sourceType: LayerType;
  style: LayerStyle;
}

const NON_STYLE_KEYS = new Set<string>([
  "id", "type", "name", "x", "y", "width", "height", "rotation", "locked", "visible",
  "flipH", "flipV", "anim", "animTracks", "patternCell", "content", "richContent", "autoResize",
  "layers", "layout", "gap", "padding", "alignItems", "justifyContent", "wrap", "pattern",
  "path", "viewW", "viewH", "drawProgress", "src", "crop", "masks", "image",
  "shapeType", "fit", "component", "instance", "isMask", "maskMode", "constraints",
  "layoutSizingH", "layoutSizingV", "layoutAbsolute", "paddingSides", "textPath", "layoutGrids", "scaleContents",
]);

const INK_PATH_KEY = "strokes";

export const isStyleKey = (key: string, layerType: LayerType): boolean =>
  !NON_STYLE_KEYS.has(key) && !(layerType === "ink" && key === INK_PATH_KEY);

export const extractLayerStyle = (layer: Layer): CopiedLayerStyle => {
  const style = Object.fromEntries(
    Object.entries(layer).filter(([key, value]) => isStyleKey(key, layer.type) && value !== undefined),
  );
  return { sourceType: layer.type, style: structuredClone(style) };
};

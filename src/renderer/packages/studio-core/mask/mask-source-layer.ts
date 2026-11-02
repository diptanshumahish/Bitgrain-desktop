import type { ImageLayer, Layer, ShapeLayer, TextLayer, UploadLayer, VectorLayer } from "../model/studio-types";

const OPAQUE = "#000000";

const outlineShape = (layer: ShapeLayer): ShapeLayer => {
  const closed = !layer.shapeType.startsWith("frame") && layer.shapeType !== "line" && layer.shapeType !== "arrow";
  const cleared = { fills: undefined, strokes: undefined, layerEffects: undefined, fillGradient: undefined, fillVar: undefined, strokeVar: undefined };
  if (!closed) return { ...layer, ...cleared, stroke: OPAQUE, fill: layer.shapeType.startsWith("frame") ? OPAQUE : layer.fill };
  return { ...layer, ...cleared, fill: OPAQUE, stroke: "transparent", strokeWidth: 0 };
};

const outlineVector = (layer: VectorLayer): VectorLayer => {
  const cleared = { fills: undefined, strokes: undefined, layerEffects: undefined, fillGradient: undefined, fillImage: undefined, fillVar: undefined, strokeColorVar: undefined };
  if (!layer.path.closed) return { ...layer, ...cleared, strokeColor: OPAQUE, fill: "transparent" };
  return { ...layer, ...cleared, fill: OPAQUE, strokeWidth: 0 };
};

const outlineText = (layer: TextLayer): TextLayer => ({ ...layer, effects: [], gradientText: undefined });

const outlineImage = (layer: ImageLayer | UploadLayer): ShapeLayer => ({
  id: layer.id,
  type: "shape",
  shapeType: "rect",
  name: layer.name,
  x: layer.x,
  y: layer.y,
  width: layer.width,
  height: layer.height,
  opacity: 1,
  locked: false,
  visible: true,
  flipH: layer.flipH,
  flipV: layer.flipV,
  rotation: layer.rotation ?? 0,
  fill: OPAQUE,
  stroke: "transparent",
  strokeWidth: 0,
  borderRadius: layer.borderRadius ?? 0,
  cornerRadii: layer.cornerRadii,
  cornerSmoothing: layer.cornerSmoothing,
});

const outlineLayer = (layer: Layer): Layer => {
  if (layer.type === "shape") return outlineShape(layer);
  if (layer.type === "vector") return outlineVector(layer);
  if (layer.type === "text") return outlineText(layer);
  if (layer.type === "image" || layer.type === "upload") return outlineImage(layer);
  return layer;
};

export const maskRenderLayer = (layer: Layer): Layer => {
  const base = { ...layer, isMask: false, visible: true, blendMode: undefined } as Layer;
  if (layer.maskMode !== "vector") return base;
  return { ...outlineLayer(base), opacity: 1 } as Layer;
};

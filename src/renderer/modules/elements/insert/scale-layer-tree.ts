import type { Layer } from "../../../data/studioTypes";

const scaleOwnFields = (layer: Layer, scale: number): Layer => {
  const scaled = {
    ...layer,
    x: layer.x * scale,
    y: layer.y * scale,
    width: layer.width * scale,
    height: layer.height * scale,
  };
  if (layer.type === "text") {
    return { ...scaled, fontSize: layer.fontSize * scale, letterSpacing: layer.letterSpacing * scale } as Layer;
  }
  if (layer.type === "vector" || layer.type === "shape") {
    return { ...scaled, strokeWidth: layer.strokeWidth * scale } as Layer;
  }
  return scaled;
};

export const scaleLayerTree = (layers: Layer[], scale: number): Layer[] =>
  layers.map((layer) => {
    const scaled = scaleOwnFields(layer, scale);
    if (scaled.type === "group" || scaled.type === "frame") {
      return { ...scaled, layers: scaleLayerTree(scaled.layers, scale) };
    }
    return scaled;
  });

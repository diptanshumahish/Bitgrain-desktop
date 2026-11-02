import type { Layer, TextLayer, VectorPath } from "../../model/studio-types";
import { shapeToVectorLayer } from "../../geometry/shape-to-vector";
import { sizingPatch } from "../layout/text-sizing";

export const isPathSource = (layer: Layer): boolean => layer.type === "vector" || layer.type === "shape";

const primaryPath = (source: Layer): VectorPath | null => {
  if (source.type === "vector") return { anchors: source.path.anchors, closed: source.path.closed };
  if (source.type === "shape") {
    const path = shapeToVectorLayer(source).path;
    return { anchors: path.anchors, closed: path.closed };
  }
  return null;
};

export const attachTextPathPatch = (source: Layer, offset: number): Partial<TextLayer> | null => {
  const path = primaryPath(source);
  if (!path || path.anchors.length < 2) return null;
  return {
    textPath: { sourceId: source.id, path, offset },
    x: source.x,
    y: source.y,
    width: source.width,
    height: source.height,
    rotation: "rotation" in source ? source.rotation : 0,
    ...sizingPatch("fixed"),
  };
};

export const detachTextPathPatch = (): Partial<TextLayer> => ({ textPath: undefined, ...sizingPatch("auto-height") });

import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import { applyResize } from "@bitgrain/studio-core/layers/studio-layers";
import { resizeTextLayer } from "../text-box/text-resize";
import { resizeGroupLayer } from "./group-resize";
import { resizeFrameToBox } from "./container-resize";
import { isTransformedLayer, keepAnchorFixed, toLocalDelta } from "./rotated-resize";

export const resizeLayer = (layer: Layer, dir: HandleDir, dx: number, dy: number, aspect = false): Partial<Layer> => {
  if (layer.type === "text") return resizeTextLayer(layer, dir, dx, dy);
  if (layer.type === "group" && !layer.pattern) return resizeGroupLayer(layer, dir, dx, dy);
  if (layer.type === "frame") return resizeFrameToBox(layer, applyResize(layer, dir, dx, dy, aspect));
  return applyResize(layer, dir, dx, dy, aspect);
};

export const resizeOnCanvas = (layer: Layer, dir: HandleDir, dx: number, dy: number, aspect = false): Partial<Layer> => {
  if (!isTransformedLayer(layer)) return resizeLayer(layer, dir, dx, dy, aspect);
  const local = toLocalDelta(layer, dx, dy);
  const patch = resizeLayer(layer, dir, local.x, local.y, aspect);
  const after = { ...layer, ...patch } as Layer;
  const anchored: Partial<Layer> = keepAnchorFixed(layer, after, dir);
  return Object.assign({}, patch, anchored);
};

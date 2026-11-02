import type { Layer } from "../../model/studio-types";
import type { FitBox, FitContext, FitSize } from "./fit-context";

const MIN_TEXT_KEEP_RATIO = 0.7;

const shortSide = (size: FitSize): number => Math.min(size.width, size.height);

const readableFloor = (page: FitContext): number =>
  (shortSide(page.to) / shortSide(page.from)) * MIN_TEXT_KEEP_RATIO;

const roomFor = (layer: Layer, page: FitContext): number =>
  Math.min(page.content.width / layer.width, page.content.height / layer.height);

export const readableTextScale = (layer: Layer, flowScale: number, page: FitContext): number => {
  if (layer.type !== "text" || layer.width <= 0 || layer.height <= 0) return flowScale;
  return Math.max(flowScale, Math.min(readableFloor(page), roomFor(layer, page)));
};

export const growAroundCenter = (box: FitBox, layer: Layer, scale: number): FitBox => {
  const width = layer.width * scale;
  const height = layer.height * scale;
  return { x: box.x + (box.width - width) / 2, y: box.y + (box.height - height) / 2, width, height };
};

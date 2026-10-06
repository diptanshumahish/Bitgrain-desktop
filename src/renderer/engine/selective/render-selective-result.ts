import type { SelectiveEffect } from "./selective-effects";
import { createCanvas } from "./brush-canvas";

export interface SelectiveResultInput {
  source: HTMLImageElement;
  mask: HTMLCanvasElement;
  effect: SelectiveEffect;
  inverted: boolean;
  maxLongEdge: number;
}

export const renderSelectiveResult = (input: SelectiveResultInput): HTMLCanvasElement => {
  const { source, mask, effect, inverted, maxLongEdge } = input;
  const longEdge = Math.max(source.naturalWidth, source.naturalHeight);
  const scale = Math.min(1, maxLongEdge / longEdge);
  const width = Math.max(1, Math.round(source.naturalWidth * scale));
  const height = Math.max(1, Math.round(source.naturalHeight * scale));
  const pixelScale = width / Math.max(1, mask.width);
  const output = createCanvas(width, height);
  const outputCtx = output.getContext("2d");
  const layer = createCanvas(width, height);
  const layerCtx = layer.getContext("2d");
  if (!outputCtx || !layerCtx) return output;
  outputCtx.drawImage(source, 0, 0, width, height);
  layerCtx.drawImage(effect.render(source, width, height, pixelScale), 0, 0);
  layerCtx.globalCompositeOperation = inverted ? "destination-out" : "destination-in";
  layerCtx.drawImage(mask, 0, 0, width, height);
  outputCtx.drawImage(layer, 0, 0);
  return output;
};

import type { Layer } from "../model/studio-types";

const PAD_RATIO = 0.1;
const DEG_TO_RAD = Math.PI / 180;

export interface MaskBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const maskBounds = (layer: Layer, effectPad: number): MaskBounds => {
  const rotation = ((layer as { rotation?: number }).rotation ?? 0) * DEG_TO_RAD;
  const cos = Math.abs(Math.cos(rotation));
  const sin = Math.abs(Math.sin(rotation));
  const width = layer.width * cos + layer.height * sin;
  const height = layer.width * sin + layer.height * cos;
  const pad = Math.ceil(Math.max(layer.width, layer.height) * PAD_RATIO + effectPad);
  const centerX = layer.x + layer.width / 2;
  const centerY = layer.y + layer.height / 2;
  return {
    x: Math.floor(centerX - width / 2 - pad),
    y: Math.floor(centerY - height / 2 - pad),
    width: Math.ceil(width + pad * 2),
    height: Math.ceil(height + pad * 2),
  };
};

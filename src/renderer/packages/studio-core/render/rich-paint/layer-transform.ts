import { applyFlip, applyRotation } from "../image-helpers";

interface TransformableLayer {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
}

export const applyLayerTransform = (ctx: CanvasRenderingContext2D, layer: TransformableLayer, s: number): void => {
  applyRotation(ctx, layer, s);
  applyFlip(ctx, layer, s);
};

import type { ImageLayer, UploadLayer } from "../../model/studio-types";
import { applyFlip, applyRotation } from "../image-helpers";
import { blankCanvas, context2d } from "./fx-canvas";

export const drawImageBackdropBlur = (
  ctx: CanvasRenderingContext2D,
  composed: HTMLCanvasElement,
  layer: ImageLayer | UploadLayer,
  radius: number,
  s: number,
): void => {
  const page = ctx.canvas;
  const blurred = blankCanvas(page.width, page.height);
  const blurredCtx = context2d(blurred);
  blurredCtx.filter = `blur(${radius * s}px)`;
  blurredCtx.drawImage(page, 0, 0);
  blurredCtx.filter = "none";
  const mask = blankCanvas(page.width, page.height);
  const maskCtx = context2d(mask);
  applyRotation(maskCtx, layer, s);
  applyFlip(maskCtx, layer, s);
  maskCtx.drawImage(composed, layer.x * s, layer.y * s, layer.width * s, layer.height * s);
  blurredCtx.globalCompositeOperation = "destination-in";
  blurredCtx.drawImage(mask, 0, 0);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = layer.opacity;
  ctx.drawImage(blurred, 0, 0);
  ctx.restore();
};

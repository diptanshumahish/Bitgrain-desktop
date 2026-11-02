import type { RichRender } from "../../shape-render/rich/rich-types";
import { applyLayerTransform } from "./layer-transform";
import { contextOf, createExportCanvas, rasterizeRichNodes, richPixelSize } from "./rich-raster";

interface BlurTarget {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
}

export const drawBackgroundBlur = async (
  ctx: CanvasRenderingContext2D,
  layer: BlurTarget,
  rich: RichRender,
  s: number,
): Promise<void> => {
  const target = ctx.canvas;
  const page = { width: target.width, height: target.height };
  const silhouette = await rasterizeRichNodes(rich, rich.coverage, s);
  const size = richPixelSize(rich, s);
  const blurred = createExportCanvas(page);
  const blurredCtx = contextOf(blurred);
  blurredCtx.filter = `blur(${rich.backgroundBlur * s}px)`;
  blurredCtx.drawImage(target, 0, 0);
  blurredCtx.filter = "none";
  const mask = createExportCanvas(page);
  const maskCtx = contextOf(mask);
  applyLayerTransform(maskCtx, layer, s);
  maskCtx.drawImage(silhouette, (layer.x - rich.margin) * s, (layer.y - rich.margin) * s, size.width, size.height);
  blurredCtx.globalCompositeOperation = "destination-in";
  blurredCtx.drawImage(mask, 0, 0);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = layer.opacity;
  ctx.drawImage(blurred, 0, 0);
  ctx.restore();
};

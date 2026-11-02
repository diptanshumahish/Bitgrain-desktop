import type { RichRender } from "../../shape-render/rich/rich-types";
import { composeRichCanvas } from "./compose-rich-canvas";
import { drawBackgroundBlur } from "./draw-background-blur";
import { applyLayerTransform } from "./layer-transform";
import { richPixelSize } from "./rich-raster";

interface RichTarget {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
}

export const drawRichLayer = async (
  ctx: CanvasRenderingContext2D,
  layer: RichTarget,
  rich: RichRender,
  s: number,
): Promise<void> => {
  const composed = await composeRichCanvas(rich, s);
  if (rich.backgroundBlur > 0 && rich.coverage.length > 0) await drawBackgroundBlur(ctx, layer, rich, s);
  const size = richPixelSize(rich, s);
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  applyLayerTransform(ctx, layer, s);
  if (rich.layerBlur > 0) ctx.filter = `blur(${rich.layerBlur * s}px)`;
  ctx.drawImage(composed, (layer.x - rich.margin) * s, (layer.y - rich.margin) * s, size.width, size.height);
  ctx.restore();
};
